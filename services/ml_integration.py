"""Service boundary between the ClimaScope ML pipeline and the backend.

Call :func:`run_ml_pipeline` from an API view, scheduled task, or command.
The returned result is ready to pass to a future database persistence function.
"""

from __future__ import annotations

import logging
from typing import Any, TypedDict, cast

from src.pipeline import run


logger = logging.getLogger(__name__)


class PredictionResult(TypedDict):
    """The ML-to-backend risk-prediction contract."""

    location_id: int
    risk_type: str
    risk_probability: float
    severity: str
    forecast_window_days: int
    confidence: float
    anomalies: list[dict[str, Any]]
    drivers: list[str]
    recommended_action: str


class MLIntegrationError(RuntimeError):
    """Raised when the ML pipeline cannot produce a valid prediction."""


REQUIRED_RESULT_FIELDS = frozenset(PredictionResult.__annotations__)


def run_ml_pipeline() -> PredictionResult:
    """Run the ML pipeline and return a validated prediction result.

    This function deliberately does not persist the result. A backend caller can
    pass its return value to a database-saving function once that layer is ready.

    Raises:
        MLIntegrationError: If model artifacts are unavailable, the pipeline
            fails, or its output does not conform to the shared data contract.
    """
    try:
        result = run()

        if not isinstance(result, dict):
            raise TypeError("The ML pipeline returned a non-dictionary result.")

        missing_fields = REQUIRED_RESULT_FIELDS.difference(result)
        if missing_fields:
            fields = ", ".join(sorted(missing_fields))
            raise ValueError(f"ML result is missing required fields: {fields}")

        prediction = cast(PredictionResult, result)
        logger.info(
            "ML prediction generated for location_id=%s: severity=%s, "
            "risk_probability=%.2f",
            prediction["location_id"],
            prediction["severity"],
            prediction["risk_probability"],
        )
        return prediction
    except Exception as exc:
        logger.exception("Failed to run the ClimaScope ML pipeline.")
        raise MLIntegrationError("Unable to generate an ML risk prediction.") from exc


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    run_ml_pipeline()
