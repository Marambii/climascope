"""Load and merge all Conduit CSV formats into one canonical table.
Formats handled:
  A) GeoCSV export: '# ' metadata lines, columns like 'Time','Rain Gauge 1',...
  B) weatherdata (N).csv: plain header, columns like ts,rg1,temp_sht,...
Canonical output columns:
  ts, rain1, rain2, temp_sht, temp_bmx, temp_mcp, humidity_sht, press_bmx,
  light_vis, light_ir, uv, wind_spd, wind_dir, wind_gust, heat_idx, wet_bulb_temp, wet_bulb_globe_temp
"""
import glob
import pandas as pd

GEOCSV_MAP = {
    'Time': 'ts', 'Rain Gauge 1': 'rain1', 'Rain Gauge 2': 'rain2',
    'SHT Temperature': 'temp_sht', 'BMX Temperature 1': 'temp_bmx', 'MCP Temperature 1': 'temp_mcp',
    'SHT Humidity': 'humidity_sht', 'BMX Pressure 1': 'press_bmx',
    'SI1145 Visible 1': 'light_vis', 'SI1145 Infrared 1': 'light_ir', 'SI1145 Ultraviolet 1': 'uv',
    'Wind Speed': 'wind_spd', 'Wind Direction': 'wind_dir',
    'Wind Gust': 'wind_gust', 'Wind Gust Direction': 'wind_gust_dir',
    'Heat Index': 'heat_idx', 'Wet Bulb Temperature': 'wet_bulb_temp',
    'Wet Bulb Globe Temperature': 'wet_bulb_globe_temp', 'Health': 'health',
}
NEW_MAP = {
    'ts': 'ts', 'rg1': 'rain1', 'rg2': 'rain2',
    'temp_sht': 'temp_sht', 'temp_bmx': 'temp_bmx', 'temp_mcp': 'temp_mcp',
    'humidity_sht': 'humidity_sht', 'press_bmx': 'press_bmx',
    'si1145_vis': 'light_vis', 'si1145_ir': 'light_ir', 'si1145_uv': 'uv',
    'wind_spd': 'wind_spd', 'wind_dir': 'wind_dir',
    'wind_gust': 'wind_gust', 'wind_gust_dir': 'wind_gust_dir',
    'heat_idx': 'heat_idx', 'wet_bulb_temp': 'wet_bulb_temp',
    'wet_bulb_globe_temp': 'wet_bulb_globe_temp',
}

def load_conduit_csv(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        first = f.readline()
    if first.startswith('ts,'):                       # format B
        df = pd.read_csv(path)
    else:                                             # format A (GeoCSV)
        df = pd.read_csv(path, comment='#')
        df = df.rename(columns=GEOCSV_MAP)
    df = df.rename(columns=NEW_MAP)
    df['ts'] = pd.to_datetime(df['ts'], utc=True)
    keep = [c for c in NEW_MAP.values() if c in df.columns]
    return df[keep].dropna(subset=['ts'])

def load_all_data(data_glob):
    files = sorted(glob.glob(data_glob))
    assert files, f'No CSVs found at {data_glob}'
    parts = []
    for p in files:
        try:
            d = load_conduit_csv(p)
            parts.append(d)
            print(f'  loaded {os.path.basename(p)}: {len(d):,} rows  {d.ts.min()} -> {d.ts.max()}')
        except Exception as e:
            print(f'  SKIPPED {os.path.basename(p)}: {e}')
    df = pd.concat(parts, ignore_index=True)
    df = df.sort_values('ts').drop_duplicates('ts').set_index('ts')
    print(f'TOTAL: {len(df):,} rows | {df.index.min()} -> {df.index.max()}')
    return df

import os  # noqa: E402
