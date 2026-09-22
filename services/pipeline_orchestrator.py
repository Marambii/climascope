"""Orchestrate ClimaScope ML analysis, decisioning, and Django persistence."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = PROJECT_ROOT / "Backend"
DJANGO_SETTINGS_MODULE = "climascope.settings"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from services.decision_engine import evaluate_environmental_risk  # noqa: E402
from services.ml_integration import run_ml_pipeline  # noqa: E402


logger = logging.getLogger(__name__)

ANOMALY_SEVERITY_MAP = {
    "NORMAL": "LOW",
    "WATCH": "LOW",
    "WARNING": "MEDIUM",
    "HIGH": "HIGH",
    "CRITICAL": "HIGH",
}


class PipelineOrchestrationError(RuntimeError):
    """Raised when a location-risk processing run cannot complete."""


def _configure_django() -> None:
    """Configure Django when this module is called outside ``manage.py``."""
    if not BACKEND_ROOT.is_dir():
        raise PipelineOrchestrationError(
            f"Django backend directory was not found: {BACKEND_ROOT}."
        )

    backend_path = str(BACKEND_ROOT)
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", DJANGO_SETTINGS_MODULE)

    try:
        import django
        from django.apps import apps
    except ImportError as exc:
        raise PipelineOrchestrationError(
            "Django is not installed. Install Backend/requirements.txt before "
            "running the pipeline orchestrator."
        ) from exc

    if not apps.ready:
        django.setup()


def _validate_location_id(location_id: int) -> None:
    """Ensure the caller supplied a valid database primary key."""
    if isinstance(location_id, bool) or not isinstance(location_id, int):
        raise PipelineOrchestrationError("location_id must be an integer.")
    if location_id <= 0:
        raise PipelineOrchestrationError("location_id must be greater than zero.")


def _database_anomaly_severity(severity: object) -> str:
    """Map ML anomaly labels to the severity values accepted by Django's model."""
    return ANOMALY_SEVERITY_MAP.get(str(severity).upper(), "LOW")


def _save_or_update_prediction(
    location: Any,
    payload: dict[str, Any],
    timestamp: Any,
    risk_prediction_model: Any,
) -> Any:
    """Update the location's latest prediction, or create its first prediction."""
    fields = {
        "timestamp": timestamp,
        "risk_type": payload["risk_type"],
        "risk_probability": payload["risk_probability"],
        "severity": payload["severity"],
        "forecast_window_days": payload["forecast_window_days"],
        "confidence": payload["confidence"],
        "drivers": payload["drivers"],
    }
    prediction = (
        risk_prediction_model.objects.select_for_update()
        .filter(location=location)
        .order_by("-timestamp")
        .first()
    )

    if prediction is None:
        return risk_prediction_model.objects.create(location=location, **fields)

    for field, value in fields.items():
        setattr(prediction, field, value)
    prediction.save(update_fields=list(fields))
    return prediction


def _record_anomalies(
    location: Any,
    payload: dict[str, Any],
    timestamp: Any,
    anomaly_model: Any,
) -> None:
    """Persist anomaly evidence produced by the ML pipeline for this run."""
    for anomaly in payload["anomalies"]:
        anomaly_model.objects.create(
            location=location,
            timestamp=timestamp,
            variable=str(anomaly.get("variable", "environmental_combination"))[:50],
            description=str(anomaly.get("description", "No description supplied.")),
            severity=_database_anomaly_severity(anomaly.get("severity")),
        )


def _create_or_update_active_alert(
    location: Any,
    payload: dict[str, Any],
    alert_model: Any,
) -> None:
    """Create one active alert per location and severity, avoiding duplicates."""
    if not payload["automated_triggers"]["trigger_alert_notification"]:
        return

    severity = payload["severity"]
    title = f"{severity} drought risk at {location.name}"
    message = (
        f"Risk probability: {payload['risk_probability']:.0%}. "
        f"Recommended action: {payload['recommended_action']}"
    )
    active_alert = alert_model.objects.select_for_update().filter(
        location=location,
        title=title,
        is_read=False,
    ).first()

    if active_alert is None:
        alert_model.objects.create(
            location=location,
            severity=severity,
            title=title,
            message=message,
        )
        return

    active_alert.severity = severity
    active_alert.message = message
    active_alert.save(update_fields=["severity", "message"])


def process_location_risk(location_id: int) -> dict[str, Any]:
    """Run, enrich, and persist the latest environmental risk for one location.

    The supplied ``location_id`` is the Django ``Location`` primary key. The
    returned payload retains the shared ML contract and decision-engine fields,
    with ``location_id`` set to that database identifier for API consumption.

    Raises:
        PipelineOrchestrationError: If Django setup, ML processing, validation,
            or database persistence fails.
    """
    _validate_location_id(location_id)

    try:
        _configure_django()
        from django.db import transaction
        from django.utils import timezone

        from api.models import Alert, Anomaly, Location, RecommendedAction, RiskPrediction

        raw_prediction = run_ml_pipeline()
        final_payload = evaluate_environmental_risk(raw_prediction)

        with transaction.atomic():
            location = Location.objects.select_for_update().filter(pk=location_id).first()
            if location is None:
                raise PipelineOrchestrationError(
                    f"Location with id={location_id} does not exist."
                )

            final_payload["location_id"] = location.pk
            timestamp = timezone.now()
            prediction = _save_or_update_prediction(
                location,
                final_payload,
                timestamp,
                RiskPrediction,
            )
            RecommendedAction.objects.update_or_create(
                prediction=prediction,
                defaults={"action_text": final_payload["recommended_action"]},
            )
            _record_anomalies(location, final_payload, timestamp, Anomaly)
            _create_or_update_active_alert(location, final_payload, Alert)

        logger.info(
            "Processed risk for location_id=%s: severity=%s, probability=%.2f",
            location_id,
            final_payload["severity"],
            final_payload["risk_probability"],
        )
        return final_payload
    except Exception as exc:
        logger.exception("Location risk processing failed for location_id=%s.", location_id)
        if isinstance(exc, PipelineOrchestrationError):
            raise
        raise PipelineOrchestrationError(
            f"Unable to process risk for location_id={location_id}."
        ) from exc
