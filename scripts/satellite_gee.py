"""Pull open satellite data for the JKUAT station via Google Earth Engine (free).
Products: MODIS NDVI (16-day, 250m, 2000-present) + CHIRPS rainfall (daily, ~5km, 1981-present).
Setup:  pip install earthengine-api  ->  earthengine authenticate  ->  run this script.
Output: outputs/satellite_monthly.csv  (merge into features_daily.csv on year-month)
"""
import sys, os; sys.path.insert(0, os.path.abspath('../src'))
import pandas as pd
from config import LAT, LON, OUTPUT_DIR

import ee
from dotenv import load_dotenv
load_dotenv()  # reads .env in project root

_ee_project = os.environ.get('EE_PROJECT')
if not _ee_project:
    raise RuntimeError(
        "Google Earth Engine now requires a Google Cloud project on every ee.Initialize() call.\n"
        "1. Create/select a project at https://console.cloud.google.com and enable the 'Earth "
        "Engine API' for it (or register one for free at https://code.earthengine.google.com/register).\n"
        "2. Add EE_PROJECT=your-project-id to your .env file (see .env.example).\n"
        "3. Re-run this script."
    )
ee.Initialize(project=_ee_project)

pt = ee.Geometry.Point([LON, LAT])

# --- NDVI (MODIS MOD13Q1, 16-day composites) ---
ndvi = (ee.ImageCollection('MODIS/061/MOD13Q1')
        .filterBounds(pt).select('NDVI')
        .map(lambda im: im.set('date', im.date().format('YYYY-MM'))))
ndvi_m = ndvi.mean().multiply(0.0001).rename('NDVI')

# --- Rainfall (CHIRPS daily) ---
chirps = (ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
          .filterBounds(pt).select('precipitation')
          .filterDate('2015-01-01', '2026-12-31'))
rain_m = chirps.mean().rename('rain_chirps_mean_daily_mm')   # climatological mean; see note below

# Monthly series (more useful than a single mean): build via reduceRegions per month is slow,
# so we use a server-side monthly composite list and pull values to a pandas DataFrame.
def monthly_series(collection, band, scale, start='2015-01-01', end='2026-12-31'):
    months = ee.List.sequence(0, ee.Date(end).difference(ee.Date(start), 'month')).getInfo()
    rows = []
    for k in months:
        t0 = ee.Date(start).advance(k, 'month')
        t1 = t0.advance(1, 'month')
        img = collection.filterDate(t0, t1).mean()
        # .get(band) alone raises "Dictionary does not contain key" whenever a month has
        # no valid pixel at this point (e.g. persistent cloud cover in that composite, or
        # zero images landing in that date window) -- reduceRegion just omits the key
        # rather than returning null. Dictionary.get() DOES take a defaultValue... but its
        # docs say a null default is treated as "no default" (still raises), so passing
        # Python None wouldn't actually change anything. Use a numeric sentinel instead,
        # then translate it back to a real Python None after pulling the value down.
        _NODATA = -9999
        val = img.reduceRegion(ee.Reducer.mean(), pt, scale).get(band, _NODATA)
        val_info = val.getInfo()
        if val_info == _NODATA:
            val_info = None
        rows.append({'year_month': t0.format('YYYY-MM').getInfo(),
                     band: val_info})
    return pd.DataFrame(rows)

ndvi_df = monthly_series(ndvi, 'NDVI', 250)
rain_df = monthly_series(chirps, 'precipitation', 5566)
sat = ndvi_df.merge(rain_df, on='year_month', how='outer')
sat.to_csv(f'{OUTPUT_DIR}/satellite_monthly.csv', index=False)
print(sat.tail())
print('Saved -> outputs/satellite_monthly.csv')

"""
NOTES / FASTER ALTERNATIVES:
1. First run: the monthly loop can take a few minutes (one server call per month x 2 products).
   For hackathon, shorten: change start='2024-01-01'.
2. Alternative without GEE: open https://power.larc.nasa.gov/ (NASA POWER API) - point query,
   no account needed, gives rainfall/temperature/NDVI proxies as CSV via URL. Good backup.
3. Merge into modelling table: features_daily['year_month'] = features_daily.index.strftime('%Y-%m'),
   then pd.merge on year_month and shift satellite columns to use LAST month's values as predictors
   (avoids look-ahead leakage).
4. Story for judges: Conduit surface measurements CALIBRATE the satellite record (the exact purpose
   of the VESOLJE-SI Conduit@Empathy1 deployment described in the space.si article).
"""
