"""End-to-end ClimaScope ML pipeline for integration.
Loads ALL Conduit CSVs in data/ -> produces the shared JSON contract.
Usage:  python -m src.pipeline
"""
import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

SRC_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SRC_DIR.parent
OUTPUTS_DIR = PROJECT_ROOT / 'outputs'
FINGERPRINT_PATH = OUTPUTS_DIR / 'fingerprint.csv'

sys.path.insert(0, str(SRC_DIR))
from config import (
    CLIP_RANGES,
    DOY_WINDOW,
    DROP_COLS,
    LOCATION_ID,
    MODEL_DIR,
    RAW_CSV_GLOB,
    SEVERITY,
)
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

def build_fingerprint_baseline(d: pd.DataFrame) -> pd.DataFrame:
    """Create the seasonal baseline required for the model's Z-score features."""
    variables = [
        'temp_max',
        'temp_mean',
        'humidity_mean',
        'humidity_min',
        'rain_mm',
        'light_mean',
    ]
    use_day_of_year = (d.index.max() - d.index.min()).days >= 180

    if use_day_of_year:
        day_of_year = d.index.dayofyear.to_numpy()
        rows = []
        for period in np.unique(day_of_year):
            distance = np.abs(day_of_year - period)
            distance = np.minimum(distance, 366 - distance)
            period_data = d.loc[distance <= DOY_WINDOW, variables]
            row = {'period': period}
            for variable in variables:
                row[f'{variable}_mean'] = period_data[variable].mean()
                row[f'{variable}_std'] = period_data[variable].std()
            rows.append(row)
        fingerprint = pd.DataFrame(rows)
    else:
        grouped = d.groupby(d.index.month)[variables].agg(['mean', 'std'])
        fingerprint = grouped.reset_index()
        fingerprint.columns = [f'{name}_{stat}' for name, stat in fingerprint.columns]
        fingerprint = fingerprint.rename(columns={fingerprint.columns[0]: 'period'})

    for variable in variables:
        fingerprint[f'{variable}_mean'] = fingerprint[f'{variable}_mean'].fillna(
            d[variable].mean()
        )
        fingerprint[f'{variable}_std'] = (
            fingerprint[f'{variable}_std']
            .replace(0, np.nan)
            .fillna(d[variable].std())
        )

    return fingerprint


def load_fingerprint_baseline(
    d: pd.DataFrame,
    fp_csv: str | Path = FINGERPRINT_PATH,
) -> pd.DataFrame:
    """Load a saved fingerprint or build and persist one when it is missing."""
    fingerprint_path = Path(fp_csv)
    fingerprint_path.parent.mkdir(parents=True, exist_ok=True)

    if fingerprint_path.is_file():
        return pd.read_csv(fingerprint_path)

    fingerprint = build_fingerprint_baseline(d)
    fingerprint.to_csv(fingerprint_path, index=False)
    return fingerprint


def build_features(
    d: pd.DataFrame,
    fp_csv: str | Path = FINGERPRINT_PATH,
) -> pd.DataFrame:
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
    fp = load_fingerprint_baseline(d, fp_csv)
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
