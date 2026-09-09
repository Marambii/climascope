"""End-to-end ClimaScope ML pipeline for integration.
Loads ALL Conduit CSVs in data/ -> produces the shared JSON contract.
Usage:  python src/pipeline.py
"""
import os, sys, json, joblib
import pandas as pd, numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import RAW_CSV_GLOB, MODEL_DIR, OUTPUT_DIR, DROP_COLS, CLIP_RANGES, LOCATION_ID, SEVERITY
from loader import load_all_data

FEATURE_COLS = json.load(open(f'{MODEL_DIR}/model_config.json'))['features']

def load_clean_daily(glob=RAW_CSV_GLOB):
    df = load_all_data(glob)
    df = df.drop(columns=[c for c in DROP_COLS if c in df.columns])
    for c, (lo, hi) in CLIP_RANGES.items():
        if c in df.columns: df.loc[~df[c].between(lo, hi), c] = np.nan
    df = df.interpolate(method='time', limit=8)
    hourly = df.resample('1h').mean(numeric_only=True)
    hourly['rain_mm'] = df[['rain1', 'rain2']].clip(lower=0).resample('1h').sum().mean(axis=1)
    d = pd.DataFrame({
        'temp_max': hourly['temp_sht'].resample('1D').max(),
        'temp_mean': hourly['temp_sht'].resample('1D').mean(),
        'humidity_mean': hourly['humidity_sht'].resample('1D').mean(),
        'humidity_min': hourly['humidity_sht'].resample('1D').min(),
        'rain_mm': hourly['rain_mm'].resample('1D').sum(),
        'light_mean': hourly['light_vis'].resample('1D').mean(),
        'wind_mean': hourly['wind_spd'].resample('1D').mean(),
    })
    d.index.name = 'date'
    return d

def build_features(d, fp_csv=f'{OUTPUT_DIR}/fingerprint.csv'):
    f = d.copy()
    # min_periods matches notebooks/02_clean_fingerprint_features.ipynb -- must stay identical
    # or this pipeline will compute a different feature table than the one the model was trained on.
    f['rain_7d'] = f['rain_mm'].rolling(7, min_periods=4).sum()
    f['rain_30d'] = f['rain_mm'].rolling(30, min_periods=15).sum()
    f['humidity_7d'] = f['humidity_mean'].rolling(7, min_periods=4).mean()
    f['humidity_min_7d'] = f['humidity_min'].rolling(7, min_periods=4).min()
    f['tempmax_7d'] = f['temp_max'].rolling(7, min_periods=4).max()
    f['light_7d'] = f['light_mean'].rolling(7, min_periods=4).mean()
    f['humidity_trend'] = f['humidity_7d'] - f['humidity_mean'].shift(7).rolling(7, min_periods=4).mean()
    f['temp_trend'] = f['tempmax_7d'] - f['temp_max'].shift(7).rolling(7, min_periods=4).max()
    rain_days = f['rain_mm'] >= 1.0
    f['dry_spell'] = rain_days.groupby((~rain_days).cumsum()).cumsum()
    fp = pd.read_csv(fp_csv)
    key = 'doy' if 'doy' in fp.columns else 'period'
    f['period'] = f.index.dayofyear if key == 'doy' else f.index.month
    f = f.merge(fp, left_on='period', right_on=key, how='left')
    for v in ['temp_mean', 'humidity_mean', 'rain_mm']:
        m_, s_ = f[f'{v}_mean'], f[f'{v}_std'].replace(0, np.nan)
        f[f'{v}_z'] = (f[v] - m_) / s_
    f['rain_deficit_30d'] = (f['rain_mm_mean'] * 30 - f['rain_30d']).clip(lower=0)
    out = f.dropna(subset=FEATURE_COLS)
    if len(out) == 0:
        raise ValueError(
            'build_features() produced 0 usable rows -- not enough clean daily data yet, '
            'or fingerprint.csv/period merge did not match any rows. Add more data or '
            're-run notebooks 01-03.'
        )
    return out

def drivers_from_row(r):
    d = []
    if r['rain_mm_z'] < -1: d.append('Low rainfall')
    if r['humidity_trend'] < -0.5 or r['humidity_mean_z'] < -1: d.append('Declining soil-moisture proxy')
    if r['temp_mean_z'] > 1: d.append('Above-average temperature')
    if r['dry_spell'] >= 14: d.append(f'Prolonged dry spell ({int(r["dry_spell"])} days)')
    return d or ['Conditions within normal range']

def severity(p):
    for thr, name in SEVERITY:
        if p >= thr: return name

def recommend(sev):
    return ('Inspect water availability and irrigation systems; schedule field visit within 48h' if sev in ('CRITICAL', 'HIGH')
            else 'Monitor daily; verify rain gauge readings; add location to watchlist' if sev == 'WATCH'
            else 'No action required - continue routine monitoring')

def run(glob=RAW_CSV_GLOB):
    d = load_clean_daily(glob)
    f = build_features(d)
    X = f[FEATURE_COLS]
    model = joblib.load(f'{MODEL_DIR}/risk_model.pkl')
    iso = joblib.load(f'{MODEL_DIR}/isolation_forest.pkl')
    cfg = json.load(open(f'{MODEL_DIR}/model_config.json'))
    proba = model.predict_proba(X)[:, 1]
    anom = -iso.score_samples(X)
    th = cfg['anomaly_thresholds']
    f['risk_probability'], f['anomaly_score'] = proba, anom
    last = f.iloc[-1]
    p = float(proba[-1]); sev = severity(p)
    anom_sev = ('CRITICAL' if anom[-1] >= th['critical'] else 'WARNING' if anom[-1] >= th['warning']
                else 'WATCH' if anom[-1] >= th['watch'] else 'NORMAL')
    return {'location_id': LOCATION_ID, 'risk_type': 'drought',
            'risk_probability': round(p, 2), 'severity': sev,
            'forecast_window_days': 21,
            # Distance of today's probability from the 0.5 decision boundary, scaled to [0,1]:
            # 0 = model is right on the fence, 1 = model is maximally sure either way. Unlike the
            # previous rolling-14-day std (which needed >=2 historical rows and returned NaN
            # otherwise), this is always defined from a single prediction.
            'confidence': round(float(abs(p - 0.5) * 2), 2),
            'anomalies': [{'variable': 'environmental_combination',
                           'description': f'Isolation Forest score {anom[-1]:.3f}', 'severity': anom_sev}],
            'drivers': drivers_from_row(last),
            'recommended_action': recommend(sev)}

if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
