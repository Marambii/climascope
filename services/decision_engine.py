"""Decision logic that converts ML predictions into operational actions."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from numbers import Real
from typing import Any, TypedDict


logger = logging.getLogger(__name__)


class AutomatedTriggers(TypedDict):
    """Flags consumed by the backend's alert and field-inspection workflows."""

    trigger_alert_notification: bool
    trigger_field_inspection: bool
    trigger_watchlist: bool


class DecisionEngineError(ValueError):
    """Raised when a prediction cannot be evaluated safely."""


SEVERITY_ALIASES = {"HIGH": "WARNING"}
VALID_SEVERITIES = frozenset({"NORMAL", "WATCH", "WARNING", "CRITICAL"})
TRIGGERS_BY_SEVERITY: dict[str, AutomatedTriggers] = {
    "NORMAL": {
        "trigger_alert_notification": False,
        "trigger_field_inspection": False,
        "trigger_watchlist": False,
    },
    "WATCH": {
        "trigger_alert_notification": False,
        "trigger_field_inspection": False,
        "trigger_watchlist": True,
    },
    "WARNING": {
        "trigger_alert_notification": True,
        "trigger_field_inspection": True,
        "trigger_watchlist": True,
    },
    "CRITICAL": {
        "trigger_alert_notification": True,
        "trigger_field_inspection": True,
        "trigger_watchlist": True,
    },
}


def _validate_probability(value: Any) -> float:
    """Return a valid model probability, rejecting booleans and out-of-range values."""
    if isinstance(value, bool) or not isinstance(value, Real):
        raise DecisionEngineError("risk_probability must be a numeric value.")

    probability = float(value)
    if not 0.0 <= probability <= 1.0:
        raise DecisionEngineError("risk_probability must be between 0.0 and 1.0.")
    return probability


def _validate_severity(value: Any) -> str:
    """Validate and normalize the ML severity label for backend consumption."""
    if not isinstance(value, str):
        raise DecisionEngineError("severity must be a string.")

    severity = SEVERITY_ALIASES.get(value.upper(), value.upper())
    if severity not in VALID_SEVERITIES:
        valid_values = ", ".join(sorted(VALID_SEVERITIES | set(SEVERITY_ALIASES)))
        raise DecisionEngineError(
            f"severity must be one of: {valid_values}."
        )
    return severity


def _validate_drivers(value: Any) -> list[str]:
    """Validate the human-readable driver list supplied by the ML layer."""
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise DecisionEngineError("drivers must be a list of strings.")
    return list(value)


def _validate_anomalies(value: Any) -> list[dict[str, Any]]:
    """Validate anomaly objects without constraining optional anomaly metadata."""
    if not isinstance(value, list) or not all(isinstance(item, Mapping) for item in value):
        raise DecisionEngineError("anomalies must be a list of dictionaries.")
    return [dict(item) for item in value]


def _build_recommendations(
    drivers: list[str],
    anomalies: list[dict[str, Any]],
    severity: str,
) -> list[str]:
    """Create deduplicated, audience-facing actions from evidence and severity."""
    driver_text = " ".join(drivers).lower()
    anomaly_text = " ".join(
        str(anomaly.get(field, ""))
        for anomaly in anomalies
        for field in ("variable", "description", "severity")
    ).lower()
    recommendations: list[str] = []

    has_low_rainfall = "low rainfall" in driver_text or "rainfall" in anomaly_text
    has_high_temperature = (
        "above-average temperature" in driver_text
        or "high temperature" in driver_text
        or "temperature" in anomaly_text
    )
    has_moisture_decline = "soil-moisture" in driver_text or "soil moisture" in driver_text
    has_dry_spell = "dry spell" in driver_text
    has_significant_anomaly = any(
        str(anomaly.get("severity", "")).upper() in {"WARNING", "HIGH", "CRITICAL"}
        for anomaly in anomalies
    )

    if has_low_rainfall and has_high_temperature:
        recommendations.append(
            "Initiate localized irrigation checks and monitor water storage levels."
        )
    elif has_low_rainfall:
        recommendations.append(
            "Inspect local water availability and prioritize water-conservation measures."
        )

    if has_moisture_decline:
        recommendations.append(
            "Verify soil-moisture conditions and inspect irrigation infrastructure."
        )
    if has_dry_spell:
        recommendations.append(
            "Schedule a field assessment and prepare drought-response resources."
        )
    if has_significant_anomaly:
        recommendations.append(
            "Verify affected sensor readings and review the anomaly with local officers."
        )
    if severity == "CRITICAL":
        recommendations.append(
            "Notify local administration and coordinate an urgent field inspection."
        )
    elif severity == "WARNING":
        recommendations.append(
            "Notify the response team and complete a field inspection within 48 hours."
        )
    elif severity == "WATCH":
        recommendations.append(
            "Add the location to the watchlist and review conditions daily."
        )

    return list(dict.fromkeys(recommendations))


def evaluate_environmental_risk(prediction_data: dict[str, Any]) -> dict[str, Any]:
    """Enrich an ML prediction with backend-ready triggers and recommendations.

    The shared ML contract fields are retained. ``automated_triggers`` and
    ``recommendations`` are added for API, notification, and scheduling flows.
    ``HIGH`` is accepted from the current ML pipeline and normalized to
    ``WARNING`` to match the backend's severity choices.

    Args:
        prediction_data: The dictionary returned by ``run_ml_pipeline``.

    Returns:
        A copy of the shared prediction contract enriched with decision data.

    Raises:
        DecisionEngineError: If required decision inputs are absent or invalid.
    """
    if not isinstance(prediction_data, dict):
        raise DecisionEngineError("prediction_data must be a dictionary.")

    try:
        probability = _validate_probability(prediction_data["risk_probability"])
        severity = _validate_severity(prediction_data["severity"])
        drivers = _validate_drivers(prediction_data["drivers"])
        anomalies = _validate_anomalies(prediction_data["anomalies"])
    except KeyError as exc:
        raise DecisionEngineError(f"Missing required prediction field: {exc.args[0]}.") from exc

    recommendations = _build_recommendations(drivers, anomalies, severity)
    enriched_payload = dict(prediction_data)
    enriched_payload.update(
        {
            "risk_probability": probability,
            "severity": severity,
            "drivers": drivers,
            "anomalies": anomalies,
            "automated_triggers": dict(TRIGGERS_BY_SEVERITY[severity]),
            "recommendations": recommendations,
        }
    )

    if recommendations:
        enriched_payload["recommended_action"] = recommendations[0]

    logger.info(
        "Decision evaluated for location_id=%s: severity=%s, "
        "alert=%s, field_inspection=%s",
        enriched_payload.get("location_id"),
        severity,
        enriched_payload["automated_triggers"]["trigger_alert_notification"],
        enriched_payload["automated_triggers"]["trigger_field_inspection"],
    )
    return enriched_payload
