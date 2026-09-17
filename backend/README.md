# ClimaScope - Backend API Service

This directory contains the Django REST Framework (DRF) backend service for **ClimaScope**. It provides telemetry data ingestion scripts, database models, and API endpoints to power the ClimaScope dashboard.

---

## Technical Stack
* **Framework:** Django 4.2+ & Django REST Framework (DRF)
* **Database:** SQLite (Development) / PostgreSQL (Production)
* **Language:** Python 3.10+
* **Data Processing:** Pandas

---

## Directory Structure

```text
backend/
├── manage.py                 # Django administrative CLI runner
├── requirements.txt          # Python dependencies
├── README.md                 # Backend documentation
├── climascope/               # Core project configuration
│   ├── settings.py           # Application settings, CORS & DRF setup
│   └── urls.py               # Main URL router
├── api/                      # Core backend application
│   ├── models.py             # Database models schema
│   ├── views.py              # API endpoint controllers
│   ├── urls.py               # API-specific URL routes
│   └── serializers.py        # Django REST Framework serializers
└── scripts/
    └── ingest_conduit.py     # Data ingestion daemon/script
