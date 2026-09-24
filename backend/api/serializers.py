from rest_framework import serializers
from .models import Alert, Anomaly, Location, RecommendedAction, RiskPrediction, SensorMeasurement

class LocationSerializer(serializers.ModelSerializer):
    """Map-ready location data with the most recent environmental status."""

    status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Location
        fields = ("id", "name", "latitude", "longitude", "is_active", "status")
        read_only_fields = fields

    def get_status(self, instance: Location) -> str:
        """Return the latest risk severity, or NORMAL before a risk run exists."""
        prediction = instance.riskprediction_set.order_by("-timestamp").first()
        return prediction.severity if prediction is not None else "NORMAL"


class TelemetrySerializer(serializers.ModelSerializer):
    """Chart-ready representation of a Conduit sensor measurement."""

    class Meta:
        model = SensorMeasurement
        fields = (
            "id",
            "timestamp",
            "temperature",
            "humidity",
            "soil_moisture",
            "rainfall",
            "pressure",
            "wind_speed",
        )
        read_only_fields = fields


class SensorMeasurementSerializer(TelemetrySerializer):
    """Backward-compatible name for the telemetry serializer."""

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'


class RecommendedActionSerializer(serializers.ModelSerializer):
    """Read-only representation of the action linked to a risk prediction."""

    class Meta:
        model = RecommendedAction
        fields = ("id", "action_text")
        read_only_fields = fields


class AnomalySerializer(serializers.ModelSerializer):
    """Read-only anomaly evidence associated with a prediction timestamp."""

    class Meta:
        model = Anomaly
        fields = ("id", "variable", "description", "severity", "timestamp")
        read_only_fields = fields


class RiskPredictionSerializer(serializers.ModelSerializer):
    """Expose a risk prediction with its action and timestamp-matched anomalies."""

    anomalies = serializers.SerializerMethodField(read_only=True)
    recommended_action = RecommendedActionSerializer(
        source="recommendedaction",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = RiskPrediction
        fields = (
            "id",
            "location_id",
            "timestamp",
            "risk_type",
            "risk_probability",
            "severity",
            "forecast_window_days",
            "confidence",
            "drivers",
            "anomalies",
            "recommended_action",
        )
        read_only_fields = fields

    def get_anomalies(self, instance: RiskPrediction) -> list[dict]:
        """Return anomaly records produced alongside this prediction."""
        anomalies = Anomaly.objects.filter(
            location=instance.location,
            timestamp=instance.timestamp,
        ).order_by("id")
        return AnomalySerializer(anomalies, many=True).data
