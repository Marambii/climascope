from rest_framework import serializers
from .models import Alert, Anomaly, Location, RecommendedAction, RiskPrediction, SensorMeasurement

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class SensorMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorMeasurement
        fields = '__all__'

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
