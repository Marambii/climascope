"""Central config - edit paths/thresholds here only."""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ALL Conduit CSVs in data/ are loaded and merged (GeoCSV export + weatherdata (N).csv)
RAW_CSV_GLOB = os.path.join(DATA_DIR, "*.csv")

LOCATION_ID = int(os.environ.get("CLIMASCOPE_LOCATION_ID", 61))   # Conduit sensor_id; override via env var if this pipeline is ever pointed at a different station
LAT, LON, ELEV = -1.099736, 37.014528, 1523.0

# physically plausible clip ranges (min, max) - canonical column names
CLIP_RANGES = {
    "temp_sht": (-5, 50), "temp_bmx": (-5, 50), "temp_mcp": (-5, 50),
    "heat_idx": (-5, 60), "wet_bulb_temp": (-5, 40), "wet_bulb_globe_temp": (-5, 45),
    "humidity_sht": (0, 100), "press_bmx": (800, 1100),
    "wind_spd": (0, 60), "wind_gust": (0, 80),
    "light_vis": (0, 150000),
}
DROP_COLS = ["health"]   # device-flag only (present only in GeoCSV format)

# fingerprint window for day-of-year baseline; falls back to month if < 6 months of data
DOY_WINDOW = 15

# risk severity thresholds on model probability
SEVERITY = [(0.80, "CRITICAL"), (0.60, "HIGH"), (0.35, "WATCH"), (0.0, "NORMAL")]

# notebook 02: proxy drought-stress label
# Top (1 - STRESS_LABEL_QUANTILE) of days by rule-based stress_score become y=1 (stressed).
STRESS_LABEL_QUANTILE = 0.80   # e.g. 0.80 -> top 20% of days labelled "stressed"

# notebook 03: Isolation Forest 
# Expected fraction of days that are genuinely anomalous multivariate combinations. Deliberately
# NOT the same number as (1 - STRESS_LABEL_QUANTILE) -- the two measure different things (a rule-
# based rainfall/heat/dryness score vs. "does this combination of readings look unusual at all"),
# but both were previously hardcoded as disconnected magic numbers in different notebooks. Now
# both live here so there's one place to see and tune what "unusual" means across the project.
ANOMALY_CONTAMINATION = 0.10
