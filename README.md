# climascope

ClimaScope is a Predictive Environmental Intelligence platform that learns the normal environmental fingerprint of a location, detects deviations, forecasts developing risks, explains the factors driving those risks, and recommends actions[cite: 1, 2]. 

This repository contains the frontend application for the MVP, which focuses on environmental stress and drought early warning. The interface turns ClimaScope's intelligence into actionable insights through real-time dashboards and visualizations.

## Core Workflow
The application visualizes the following pipeline:
**Fingerprint → Detect → Forecast → Explain → Act**[cite: 1, 2]

## Key Features
* **Main Dashboard:** Overview displaying risk summary cards for Normal, Watch, Warning, and Critical locations[cite: 1].
* **Location Details & Visualizations:** Detailed views showing current measurements, historical trends, anomalies, and risk trajectory using time-series graphs[cite: 1].
* **Explanation UI:** Clear, human-readable breakdown of the major environmental drivers behind a risk prediction[cite: 1].
* **Action Centre:** Actionable recommendations based on environmental stress alerts (e.g., Watchlist, Field Inspection)[cite: 1].

## Tech Stack
* **Framework:** React with TypeScript (TSX)[cite: 1]
* **Build Tool:** Vite[cite: 1]
* **Routing:** TanStack Router (File-based routing)
* **Visualizations:** Apache ECharts (`echarts-for-react`)
* **Data Fetching:** Fetch/Axios with local JSON mocking for rapid MVP development

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
* Node.js (v18 or higher recommended)
* npm, yarn, or pnpm

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   git clone <repository-url>
   cd climascop-ui
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

