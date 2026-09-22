**ClimaScope – Team Roles & Project Task Breakdown**

_Environmental Intelligence Platform | Hackathon MVP_

ClimaScope is a Predictive Environmental Intelligence platform that learns the normal environmental fingerprint of a location, detects deviations, forecasts developing risks, explains the factors driving those risks, and recommends actions.

# 1\. Project Goal

The hackathon MVP will focus on environmental stress/drought early warning while keeping the architecture extensible to future use cases such as flood risk, crop stress/disease, water stress, and other environmental risks.

**Core workflow:** Fingerprint → Detect → Forecast → Explain → Act

# 2\. Team Structure

| Team Member | Primary Role               | Main Responsibility                                                              |
| ----------- | -------------------------- | -------------------------------------------------------------------------------- |
| Baruch      | Frontend Lead              | Dashboard, maps, visualizations, alerts, UX                                      |
| Nevean      | ML/AI Lead                 | Environmental fingerprinting, anomaly detection, risk prediction, explainability |
| Josh        | Backend Lead               | API, database, Conduit data ingestion, backend infrastructure                    |
| Felix       | Integration & Data/Backend | ML integration, processing pipeline, decision engine, notifications, deployment  |

# 3\. Baruch — Frontend Lead

Main goal: Build the interface that turns ClimaScope's intelligence into something a user can understand and act on.

## A. Project Setup

- Set up React/Vite/TypeScript project and folder structure.
- Set up routing and reusable components.
- Establish styling/design system.
- Connect the frontend to backend APIs.

## B. Main Dashboard

- Build overview dashboard.
- Display risk summary cards for Normal, Watch, Warning, and Critical locations.
- Display recent alerts and locations requiring attention.

## C. Environmental Map

- Build map showing monitored locations/Conduit stations.
- Colour-code locations by risk status.
- Allow users to click a location and open its details.

## D. Location Details

- Show current environmental status, risk probability, forecast window, and confidence.
- Display current measurements and historical trends.
- Display anomalies, risk factors, and predicted trajectory.

## E. Visualizations

- Build temperature, rainfall, soil moisture, vegetation, anomaly, and risk graphs.
- Clearly visualize Historical → Current → Predicted conditions.

## F. Explanation UI

- Create a 'Why is this location at risk?' section.
- Display the major model/environmental drivers in clear language.

## G. Action Centre & Alerts

- Add Watchlist, Field Inspection, View Evidence, Compare Locations, Report, and Alert actions.
- Build alert list/details, severity indicators, and read/unread states.

# 4\. Nevean — ML/AI Lead

Main goal: Turn environmental data into reliable, explainable environmental intelligence.

## A. Data Understanding

- Determine what Conduit data is available, including variables, locations, frequency, and historical depth.
- Identify useful supplementary datasets such as historical weather, satellite vegetation, soil moisture, and rainfall data.
- Create a data dictionary.

## B. Data Preprocessing

- Handle missing values and duplicates.
- Standardize timestamps and align measurements.
- Handle invalid/outlier sensor readings.
- Resample data where necessary.

## C. Environmental Fingerprint

- Build location-specific and season-aware baselines.
- Calculate seasonal means/medians, standard deviations, percentiles, ranges, rolling averages, and trends.
- Represent what normal environmental behaviour looks like for each location.

## D. Feature Engineering

- Create current-value, rolling-window, anomaly, and trend features.
- Examples: 7/14/30-day rainfall, soil moisture averages, rainfall anomaly, temperature anomaly, and soil-moisture decline rate.

## E. Anomaly Detection

- Build a statistical anomaly baseline using deviations/Z-scores.
- Experiment with Isolation Forest for unusual combinations of environmental variables.
- Produce anomaly scores and severity/status.

## F. Risk Prediction

- Create an environmental stress/drought prediction model.
- Start with interpretable baselines such as Logistic Regression or Random Forest.
- Experiment with XGBoost if appropriate.
- Avoid complex deep learning unless the available data justifies it.

## G. Model Evaluation

- Evaluate models using appropriate metrics such as precision, recall, F1, ROC-AUC, and confusion matrices.
- Use time-aware validation so future information does not leak into training.

## H. Explainability

- Identify the main factors behind each prediction using feature importance, SHAP where feasible, and/or rule-based explanations.
- Generate human-readable drivers such as low rainfall, declining soil moisture, and above-baseline temperature.

## I. Model Packaging

- Package preprocessing, fingerprinting, anomaly detection, prediction, and explainability into reusable Python modules.
- Document model inputs, outputs, and how Felix can call the prediction pipeline.

# 5\. Josh — Backend Lead

Main goal: Build the infrastructure that stores environmental information and exposes ClimaScope intelligence through APIs.

## A. Backend Setup

- Set up Django/Django REST Framework (or agreed backend framework).
- Configure PostgreSQL, environment variables, CORS, and development/production settings.

## B. Database

- Design tables/models for Locations, Sensor Measurements, Environmental Features, Environmental Baselines, Anomalies, Risk Predictions, Alerts, Watchlists, Field Inspections, and Recommended Actions.

## C. Conduit Data Ingestion

- Build the mechanism for receiving/fetching Conduit measurements.
- Validate timestamps, location IDs, sensor IDs, missing values, and invalid readings.
- Store measurements in the database.

## D. Environmental APIs

- Build endpoints for locations, measurements, and historical data.
- Examples: GET /api/locations, GET /api/locations/{id}, GET /api/locations/{id}/measurements, GET /api/locations/{id}/history.

## E. ML Results APIs

- Expose predictions, anomalies, explanations, and forecasts to the frontend.
- Examples: GET /api/locations/{id}/risk, /anomalies, /explanation, and /forecast.

## F. Alerts & Reports

- Create and store alerts based on analysis results.
- Provide alert retrieval endpoints.
- Support environmental report generation and/or report data endpoints.

## G. Backend Documentation

- Document API endpoints, request/response formats, database schema, environment variables, and setup instructions.

# 6\. Felix — Integration, Data Pipeline & Decision Engine

Main goal: Connect the ML, backend, data processing, and decision-making components so the complete system works end-to-end.

## A. Integration Contract

- Work with all team members to define the data flowing between the frontend, backend, and ML system.
- Agree on a standard prediction/result JSON format.

## B. ML ↔ Backend Integration

- Integrate Nevean's packaged models into the backend/application.
- Create the analysis flow that passes environmental data into the ML pipeline and receives predictions.

## C. Processing Pipeline

- Coordinate new data → feature processing → model prediction → explanation → decision flow.
- Ensure outputs are stored and available through Josh's APIs.

## D. Decision Engine

- Convert model probabilities into Normal/Watch/Warning/Critical severity levels.
- Trigger appropriate actions based on risk thresholds and supporting evidence.

## E. Recommended Actions

- Convert predictions into practical recommendations.
- Example: high environmental stress risk + declining soil moisture → recommend water-availability inspection.

## F. Automated Processing

- Implement scheduled processing of new Conduit data.
- For the hackathon, simulate real-time processing if full infrastructure is unnecessary.

## G. Notifications

- If time permits, implement email, browser, or in-app notifications.
- Prioritize the core prediction and alert pipeline before advanced notifications.

## H. Deployment & End-to-End Testing

- Help deploy frontend, backend, ML pipeline, and database.
- Test the full flow outside individual development machines.

# 7\. Shared Data Contract

All four members should agree on the format returned by the ML/integration layer before building too far. A suggested result is:

{  
"location_id": 12,  
"risk_type": "drought",  
"risk_probability": 0.78,  
"severity": "HIGH",  
"forecast_window_days": 21,  
"confidence": 0.84,  
"anomalies": \[  
{  
"variable": "rainfall",  
"description": "Below seasonal baseline",  
"severity": "HIGH"  
}  
\],  
"drivers": \[  
"Low rainfall",  
"Declining soil moisture",  
"Above-average temperature"  
\],  
"recommended_action": "Inspect water availability"  
}

# 8\. Recommended Development Order

| Phase                          | Owner    | Deliverable                                                                                                     |
| ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| Phase 1 — Foundation           | All four | Agree on the exact MVP, dataset, variables, database schema, API contract, UI wireframes, and ML output format. |
| Phase 2 — Parallel Development | Nevean   | Build data preprocessing, environmental fingerprint, anomaly detection, and baseline risk model.                |
| Phase 2 — Parallel Development | Josh     | Build database, backend models, API, and Conduit ingestion.                                                     |
| Phase 2 — Parallel Development | Baruch   | Build UI design, dashboard, map, location page, and charts.                                                     |
| Phase 2 — Parallel Development | Felix    | Build integration architecture, ML loading, processing pipeline, and decision engine.                           |
| Phase 3 — Vertical Slice       | All four | Connect one location end-to-end: data → ML → risk → API → dashboard.                                            |
| Phase 4 — Expansion            | All four | Add more locations, improve models, polish UI, alerts, reports, and deployment.                                 |

# 9\. Final Team Task Checklist

## Nevean — ML

- ☐ Explore Conduit dataset
- ☐ Create data dictionary
- ☐ Clean dataset
- ☐ Handle missing values
- ☐ Create environmental fingerprint
- ☐ Engineer features
- ☐ Build statistical anomaly detection
- ☐ Build Isolation Forest
- ☐ Create drought/stress target
- ☐ Train baseline risk model
- ☐ Train improved model
- ☐ Evaluate models
- ☐ Implement explainability
- ☐ Generate recommendations
- ☐ Package ML pipeline
- ☐ Document model inputs/outputs

## Josh — Backend

- ☐ Set up backend
- ☐ Configure PostgreSQL
- ☐ Create database schema
- ☐ Create Location model
- ☐ Create Measurement model
- ☐ Create Feature model
- ☐ Create Anomaly model
- ☐ Create RiskPrediction model
- ☐ Create Alert model
- ☐ Build Conduit ingestion
- ☐ Build location APIs
- ☐ Build measurement APIs
- ☐ Build prediction APIs
- ☐ Build anomaly APIs
- ☐ Build alert APIs
- ☐ Build report API
- ☐ Document API

## Baruch — Frontend

- ☐ Set up React application
- ☐ Design UI system
- ☐ Build navigation
- ☐ Build dashboard
- ☐ Build environmental map
- ☐ Build location details
- ☐ Build environmental graphs
- ☐ Build risk indicators
- ☐ Build anomaly display
- ☐ Build explanation section
- ☐ Build action centre
- ☐ Build alerts
- ☐ Build watchlist
- ☐ Build reports UI
- ☐ Connect APIs
- ☐ Handle loading/error states
- ☐ Responsive design
- ☐ Final UI polish

## Felix — Integration

- ☐ Define data contracts
- ☐ Design ML/backend integration
- ☐ Integrate trained ML models
- ☐ Build analysis pipeline
- ☐ Build feature-processing orchestration
- ☐ Build risk classification
- ☐ Build decision engine
- ☐ Build recommendation engine
- ☐ Build alert triggering
- ☐ Implement scheduled processing
- ☐ Integrate notification system
- ☐ Connect frontend/backend/ML
- ☐ Integration testing
- ☐ Deployment
- ☐ End-to-end testing

# 10\. Critical Team Principle

**Do not wait until every component is finished before integration.** Build an early vertical slice using one location and a simple baseline model. The goal is to prove that Conduit/mock data can flow through the backend and ML pipeline, produce a risk result, and appear correctly on the frontend. The models and UI can then be improved incrementally.

**Fingerprint → Detect → Forecast → Explain → Act**