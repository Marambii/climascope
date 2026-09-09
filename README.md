# ClimaScope - ML Pipeline 
Fingerprint -> Detect -> Forecast -> Explain -> Act

## Install 
  Intialize a virtual environment
    pip install -r requirements.txt


## Data
Put ALL Conduit CSVs in data/ - both formats are auto-detected and merged:
 


## Model I/O contract (for integration)
Call:  python src/pipeline.py  ->   JSON:
{location_id, risk_type:'drought', risk_probability, severity:NORMAL/WATCH/HIGH/CRITICAL,
 forecast_window_days:21, confidence, anomalies[], drivers[], recommended_action}
Models: models/risk_model.pkl, isolation_forest.pkl, model_config.json.

## Honest limitations
- No ground-truth drought labels: top 20% of stress_score (guarantees class balance even in a fully dry season).

