# ClimaScope 🌍

## Predictive Environmental Intelligence for Early Hazard Detection

**ClimaScope** is a Predictive Environmental Intelligence platform that learns what **normal environmental conditions** look like for a location, detects when those conditions begin to change, forecasts the likely direction of that change, explains the factors driving the risk, and recommends an appropriate action.

The project follows a simple intelligence pipeline:

> **Fingerprint → Detect → Forecast → Explain → Act**

For this hackathon MVP, we focused specifically on **drought and environmental stress early warning**. Drought was deliberately chosen as one concrete use case so that the team could build and demonstrate the complete pipeline rather than spreading the MVP across several partially implemented hazards.

The important architectural idea, however, is that **ClimaScope is not a drought-only system**. The same pipeline can support multiple environmental hazards by changing the input variables, baseline/fingerprint, detection logic, and prediction target. The core architecture remains the same.

**Potential hazard applications include:**

- 🌵 Drought and water stress
- 🌊 Flood risk
- 🌱 Crop/environmental stress
- 🌾 Agricultural productivity risk
- 🔥 Wildfire/environmental dryness risk
- 💧 Water-resource stress
- 🌡️ Heat and temperature-related environmental risk

---

## 1. Problem Statement

Environmental hazards rarely appear suddenly. Conditions such as drought often develop gradually through a combination of changes in rainfall, temperature, soil moisture, vegetation and other environmental signals.

However, environmental data is often presented as isolated measurements or historical charts. This makes it difficult for a farmer, environmental officer, researcher or decision-maker to answer the questions that matter most:

1. **What is happening right now?**
2. **Is this different from what is normal for this location?**
3. **Is the situation getting worse?**
4. **What is likely to happen next?**
5. **Why is the system raising an alert?**
6. **What should be done about it?**

This creates a gap between **raw environmental data** and **actionable early warning**.

### Who is affected?

The consequences of environmental stress can affect:

- Farmers and agricultural communities
- Water-resource managers
- Environmental agencies
- Local communities
- Humanitarian and disaster-response organizations
- Researchers and climate analysts
- Decision-makers planning resource allocation

For the MVP, ClimaScope focuses on **drought/environmental stress**, where early identification can provide more time to inspect water availability, monitor affected areas and prepare appropriate interventions.

---

## 2. Our Solution

ClimaScope converts environmental measurements into an explainable risk signal.

Instead of asking only:

> "What is the temperature or rainfall today?"

ClimaScope asks:

> "How does the current environment compare with its normal fingerprint, where is it heading, and what should we pay attention to?"

### How it works

#### 1. Fingerprint

ClimaScope establishes a baseline for what environmental conditions normally look like for a location.

The fingerprint can incorporate signals such as:

- Rainfall
- Temperature
- Soil moisture
- Vegetation indicators
- Water-related measurements
- Historical trends
- Seasonal patterns

This allows the system to compare current conditions against a meaningful local baseline rather than using one universal threshold for every location.

#### 2. Detect

Incoming measurements are compared with the environmental fingerprint.

The system identifies unusual conditions such as:

- Rainfall below the expected range
- Declining soil moisture
- Persistent temperature increases
- Negative vegetation trends
- Unusual combinations of environmental variables

#### 3. Forecast

The system uses the current environmental state and its trajectory to estimate the likelihood of continued environmental stress.

For the current MVP, the prediction output is structured around a drought-risk forecast.

#### 4. Explain

A warning is more useful when the user can understand why it was generated.

ClimaScope therefore exposes the environmental drivers behind a prediction, for example:

> **High drought risk**
>
> - Rainfall is below the local baseline
> - Soil moisture is declining
> - Temperature is above the expected range

#### 5. Act

The system translates the warning into an action-oriented recommendation, such as:

- Monitor the location
- Add the location to a watchlist
- Conduct a field inspection
- Inspect water availability
- Investigate environmental conditions
- Prepare a response/report

This turns environmental monitoring into a **decision-support workflow**.

---

## 3. Why Drought for the MVP?

ClimaScope is designed as a **multi-hazard architecture**, but attempting to fully implement drought, floods, crop stress and other hazards simultaneously would make the MVP unnecessarily broad.

We therefore chose drought as the first hazard to demonstrate the complete system:

**Environmental data → baseline → anomaly detection → risk prediction → explanation → action**

Once that pipeline is established, other hazards can use the same architecture with different environmental inputs and prediction targets.

### Multi-hazard design

Conceptually:

```text
                         ┌──────────────────────┐
                         │ Environmental Data   │
                         │ Conduit + other data │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Data Processing      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Environmental        │
                         │ Fingerprint          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Detect Deviations    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Forecast Risk        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Explain Risk         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Recommend Action     │
                         └──────────────────────┘

                 Same architecture → different hazard inputs

       Drought       Flood       Crop Stress       Heat       Water Stress
          │             │              │              │              │
       rainfall      rainfall       vegetation     temperature     water level
       soil moisture runoff          soil moisture  humidity        flow
       temperature   soil moisture   temperature    etc.            etc.
```

The **architecture stays consistent**; what changes is the environmental fingerprint, relevant variables, detection features and prediction target.

---

## 4. Conduit Data

A key part of the project is the use of **Conduit@Empathy environmental data**.

The supplied Conduit data is provided as CSV files and forms the environmental input layer for the ML pipeline.

### How the data is used

The pipeline:

1. Loads the Conduit CSV files.
2. Automatically detects and combines the supported CSV formats.
3. Cleans and prepares the environmental observations.
4. Organizes measurements by location and time.
5. Derives environmental stress features.
6. Compares current conditions with expected conditions.
7. Uses the resulting features for anomaly detection and drought-risk prediction.
8. Produces structured JSON output that can be consumed by the application.

The current ML pipeline expects Conduit CSV files to be placed in:

```text
data/
```

The system is intentionally designed around environmental **signals**, rather than a single hard-coded measurement. This is what makes the same architecture transferable to other hazards.

---

## 5. Key Features

### Environmental Risk Dashboard

Provides an overview of monitored locations and their current risk states.

Risk states are represented as:

- **NORMAL**
- **WATCH**
- **HIGH / WARNING**
- **CRITICAL**

### Location-Level Intelligence

Users can inspect an individual location and see:

- Current environmental measurements
- Historical trends
- Detected anomalies
- Environmental risk trajectory
- Forecast information
- Confidence
- Main environmental drivers

### Risk Explanation

Instead of presenting a prediction as a black box, ClimaScope communicates the environmental signals contributing to the warning.

### Action Centre

The interface connects risk information with potential actions, including:

- Watchlist
- Field inspection
- Monitoring
- Investigation of water availability

### Risk Trajectory

Time-series visualizations help users see the transition from historical conditions to the current state and predicted trajectory.

### Structured ML Output

The ML pipeline produces a machine-readable result that can be integrated with a backend or frontend:

```json
{
  "location_id": 12,
  "risk_type": "drought",
  "risk_probability": 0.78,
  "severity": "HIGH",
  "forecast_window_days": 21,
  "confidence": 0.84,
  "anomalies": [],
  "drivers": [],
  "recommended_action": "Inspect water availability"
}
```

*The values above illustrate the output contract; actual predictions should be generated by the pipeline rather than assumed from this example.*

---

## 6. Technology Stack

### Frontend

- **React**
- **TypeScript / TSX**
- **Vite**
- **TanStack Router** — file-based routing
- **Apache ECharts**
- **echarts-for-react**
- Fetch/Axios-style data fetching
- Local JSON data for the current MVP interface

### Machine Learning / Data Processing

- **Python**
- **pandas** — data loading and transformation
- **NumPy** — numerical processing
- **scikit-learn** — machine-learning components
- Statistical/environmental feature engineering
- Anomaly detection
- Risk classification/prediction

The current repository includes serialized model artifacts such as:

```text
models/risk_model.pkl
models/isolation_forest.pkl
models/model_config.json
```

### Data

- Conduit@Empathy CSV environmental data
- Historical environmental observations/features used by the ML pipeline

### Storage / APIs

The current hackathon MVP can operate with local data files and local JSON data, allowing the project to be demonstrated without requiring a production database.

The architecture is designed so that the data and prediction layers can later be exposed through a backend API and persistent database.

### Cloud / Deployment

The current repository is primarily structured for local MVP development. Cloud deployment can be added as the system moves toward production.

---

## 7. System Architecture

ClimaScope is divided conceptually into four layers:

```text
┌─────────────────────────────────────────────────────────┐
│                    DATA SOURCES                         │
│                                                         │
│  Conduit@Empathy CSVs     Historical/Open Data          │
└───────────────────────────────┬─────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                 DATA / ML PIPELINE                      │
│                                                         │
│  Load → Clean → Feature Engineering → Fingerprint      │
│                    │                                    │
│                    ▼                                    │
│             Anomaly Detection                           │
│                    │                                    │
│                    ▼                                    │
│              Risk Prediction                            │
│                    │                                    │
│                    ▼                                    │
│              Explain + Recommend                        │
└───────────────────────────────┬─────────────────────────┘
                                │
                         Structured JSON
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                          │
│                                                         │
│  Dashboard → Location → Trends → Explanation → Action   │
└───────────────────────────────┬─────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                 FUTURE INTEGRATION                      │
│                                                         │
│ API → Database → Alerts → Reports → Field Workflows    │
└─────────────────────────────────────────────────────────┘
```

### ML-to-application contract

The separation between the ML pipeline and the user interface is intentional.

The model does not need to know how the dashboard is implemented. It produces a structured prediction containing:

- Location
- Hazard type
- Probability
- Severity
- Forecast window
- Confidence
- Anomalies
- Drivers
- Recommended action

This makes it possible to replace or improve the model without redesigning the entire application.

---

## 8. Repository Structure

The repository contains the application interface and the environmental ML pipeline. The main conceptual components are:

```text
climascope/
│
├── data/                  # Conduit environmental CSV inputs
├── models/                # Trained model artifacts/configuration
├── src/                   # ML pipeline and processing logic
├── ...                    # React/Vite application files
└── README.md
```

The exact file organization may evolve as the frontend, ML pipeline and future backend are integrated further.

---

## 9. Installation and Setup

### Prerequisites

For the frontend:

- Node.js 18+
- npm, yarn or pnpm

For the ML pipeline:

- Python 3.x
- pip
- A virtual environment is recommended

### Clone the repository

```bash
git clone https://github.com/Marambii/climascope.git
cd climascope
```

### Frontend

Install dependencies using the package manager defined by the repository:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

### ML pipeline

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Place the Conduit CSV files in:

```text
data/
```

Run the ML pipeline:

```bash
python src/pipeline.py
```

The pipeline produces structured JSON containing the risk assessment and supporting information.

### Environment variables and secrets

If future integrations require API keys, database credentials or other secrets, they should be stored in environment variables or a local `.env` file.

**Do not commit secrets, API keys, passwords or credentials to the repository.**

---

## 10. Usage

### Viewing the application

Start the frontend development server:

```bash
npm run dev
```

Open the local URL supplied by Vite.

The user can then:

1. View the overall environmental risk dashboard.
2. Identify locations requiring attention.
3. Select a location.
4. Inspect current measurements and historical trends.
5. Review detected anomalies.
6. Examine the predicted risk trajectory.
7. Read the explanation for the warning.
8. Review the recommended action.

### Running the ML pipeline

After placing the Conduit data in `data/`:

```bash
python src/pipeline.py
```

The resulting structured prediction can then be used by the frontend or future backend integration.

---

## 11. Data Sources

### Primary

**Conduit@Empathy**

Conduit environmental data is the primary project dataset used by the ML pipeline.

It provides the environmental observations from which ClimaScope derives the signals used for environmental fingerprinting, anomaly detection and drought-risk prediction.

### Additional / Future Sources

The architecture can be extended to incorporate other sources such as:

- Historical environmental datasets
- Satellite-derived vegetation information
- Soil moisture datasets
- Rainfall datasets
- Temperature datasets
- Water-level or hydrological observations
- Other open environmental data APIs

The purpose of adding these sources is not simply to collect more data, but to create a richer environmental fingerprint and improve the reliability of hazard detection.

---

## 12. AI / Machine Learning Usage

Machine learning is used as the intelligence layer of ClimaScope.

### Environmental fingerprinting

The system establishes a representation of normal environmental behaviour for a location.

### Anomaly detection

Anomaly detection identifies environmental states that differ from expected patterns.

The repository includes an Isolation Forest model artifact:

```text
models/isolation_forest.pkl
```

### Risk prediction

The repository also includes a trained risk model:

```text
models/risk_model.pkl
```

The model is used to estimate drought/environmental-stress risk from the engineered environmental features.

### Explainability

The prediction output includes:

- Anomalies
- Environmental drivers
- Confidence
- Recommended action

This allows the application to communicate the reasoning behind a warning rather than displaying only a risk score.

### Important model limitation

The current drought pipeline does **not** have independently verified ground-truth drought labels. The repository therefore documents a limitation in which drought/stress classification uses a stress-score-based approach, including a top-20%-of-stress-score threshold for the current training setup.

This means the current model should be treated as an **MVP early-warning prototype**, not as a validated operational drought forecasting system.

A future production version should be trained and evaluated against independently validated drought observations, historical events, or established drought indices.

### AI-assisted development

AI-assisted development tools were used to support parts of the development process, including:

- Brainstorming and refining the system architecture
- Exploring feature ideas
- Code scaffolding and debugging
- Documentation and README development
- Explaining technical concepts during implementation

The project direction, hazard selection, system requirements, data interpretation and final implementation decisions remained under the team's control and were tested against the project requirements and available data.

---

## 13. Screenshots / Demo

The application is designed around an intelligence-first dashboard rather than a generic weather dashboard.

Recommended demo flow:

```text
Dashboard
   ↓
Select a location
   ↓
Current environmental state
   ↓
Historical vs expected conditions
   ↓
Detected anomaly
   ↓
Predicted drought risk
   ↓
Why is the risk increasing?
   ↓
Recommended action
```

For the final submission, screenshots/GIFs of the following views should be added to this section:

1. Main risk dashboard
2. Location details
3. Environmental trend graph
4. Risk trajectory
5. Explanation/drivers
6. Action Centre

### Demo

**Repository:**  
https://github.com/Marambii/climascope

**Project demonstration:**  
_Add the final demo/video link here._

---

## 14. Team

ClimaScope was developed collaboratively with responsibilities divided across the main system layers.

| Team member | Role | Main responsibility |
|---|---|---|
| **Baruch** | Frontend Lead | Dashboard, visualizations, location views, user experience and frontend integration |
| **Nevean** | ML / AI Lead | Environmental data processing, feature engineering, fingerprinting, anomaly detection, risk prediction and explainability |
| **Josh** | Backend Lead | Backend architecture, data/API layer and integration infrastructure |
| **Felix** | Integration & Decision Engine | ML/backend integration, risk classification, decision logic, recommendations and end-to-end integration |

The team structure was designed so that the frontend, ML and backend components could be developed in parallel and then connected through a shared prediction contract.

---

## 15. Future Development

The current MVP demonstrates drought early warning, but the long-term goal is a **multi-hazard Predictive Environmental Intelligence platform**.

### Multi-hazard expansion

The same architecture can support:

#### 🌊 Flood risk

Replace/extend the input fingerprint with variables such as:

- Rainfall intensity
- Cumulative rainfall
- Soil saturation
- River/water levels
- Runoff-related measurements

The detection and prediction target would then become flood risk.

#### 🌱 Crop stress

Inputs could include:

- Soil moisture
- Temperature
- Rainfall
- Vegetation indices
- Crop/environmental conditions

The system could detect abnormal crop stress and forecast deterioration.

#### 🔥 Environmental dryness / wildfire risk

Relevant inputs could include:

- Temperature
- Rainfall deficit
- Soil/vegetation dryness
- Humidity
- Wind conditions

#### 💧 Water stress

The same pipeline could monitor:

- Water availability
- Rainfall
- Soil moisture
- Hydrological measurements
- Demand-related indicators

### Platform improvements

Future development also includes:

- Real-time Conduit ingestion
- Automated scheduled predictions
- Persistent database storage
- Backend API integration
- Interactive geographic maps
- More historical and satellite data
- Improved model validation
- Established drought/flood/crop-stress labels
- Model monitoring and retraining
- Alert notifications
- PDF/report generation
- Field-inspection workflows
- Cloud deployment
- Role-based access for different users
- Human feedback loops to improve predictions

The long-term architecture is therefore:

> **One intelligence engine + multiple environmental hazard modules**

rather than building a completely separate application for every hazard.

---

## 16. Current Limitations

ClimaScope is a hackathon MVP and should be interpreted within that scope.

Current limitations include:

- The drought model does not yet use independently validated ground-truth drought labels.
- The current interface uses local/mock application data for rapid MVP development.
- Production-grade real-time ingestion and persistent backend infrastructure are future steps.
- Model performance needs broader validation across locations, seasons and environmental conditions.
- Additional environmental data sources would improve the robustness of the environmental fingerprint.
- The system currently demonstrates drought rather than fully implementing every proposed hazard.

These limitations are deliberate trade-offs made to demonstrate a complete end-to-end concept within the project timeframe.

---

## 17. Why ClimaScope?

Most environmental monitoring systems answer:

> **"What is the environmental data?"**

ClimaScope aims to answer:

> **"What is changing, what could happen next, why is it happening, and what should we do?"**

Its key value is therefore not just visualization or prediction in isolation.

ClimaScope connects:

**Data → Intelligence → Explanation → Decision → Action**

And because the architecture is hazard-agnostic, the drought MVP is only the first application of a broader environmental intelligence system.

---

## 18. License

This project was developed as a hackathon MVP.

If the repository is released for public reuse, an explicit open-source license should be included in the repository (for example, the MIT License) together with the corresponding `LICENSE` file.

---

## Project Links

- **GitHub:** https://github.com/Marambii/climascope
- **Demo:** _Add final demo URL_
- **Video:** _Add final submission video URL_

---

### ClimaScope

> **Fingerprint the environment. Detect change. Forecast risk. Explain why. Act early.**
