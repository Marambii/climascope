import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from django.shortcuts import get_object_or_404
from .models import Location, SensorMeasurement, RiskPrediction, Anomaly, Alert, RecommendedAction
from .serializers import (
    AlertSerializer,
    LocationSerializer,
    RiskPredictionSerializer,
    SensorMeasurementSerializer,
    TelemetrySerializer,
)


logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_active_locations(request: Request) -> Response:
    """Return active monitoring locations for the map."""
    try:
        locations = Location.objects.filter(is_active=True).order_by("name")
        return Response(LocationSerializer(locations, many=True).data)
    except Exception:
        logger.exception("Unable to retrieve active monitoring locations.")
        return Response(
            {"detail": "Unable to retrieve monitoring locations."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_location_telemetry(request: Request, location_id: int) -> Response:
    """Return the 50 most recent telemetry readings for one location."""
    try:
        location = Location.objects.get(pk=location_id)
        measurements = SensorMeasurement.objects.filter(location=location).order_by(
            "-timestamp"
        )[:50]
        return Response(TelemetrySerializer(measurements, many=True).data)
    except Location.DoesNotExist:
        return Response(
            {"detail": "Location was not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception:
        logger.exception("Unable to retrieve telemetry for location_id=%s.", location_id)
        return Response(
            {"detail": "Unable to retrieve location telemetry."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

class LocationListView(APIView):
    """GET /api/locations - List all monitored stations."""
    def get(self, request):
        locations = Location.objects.all()
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)

class LocationDetailView(APIView):
    """GET /api/locations/{id} - Retrieve detailed information for a station."""
    def get(self, request, loc_id):
        location = get_object_or_404(Location, pk=loc_id)
        serializer = LocationSerializer(location)
        return Response(serializer.data)

class LocationMeasurementsView(APIView):
    """GET /api/locations/{id}/measurements - Fetch recent telemetry."""
    def get(self, request, loc_id):
        location = get_object_or_404(Location, pk=loc_id)
        measurements = SensorMeasurement.objects.filter(location=location)[:50]
        serializer = SensorMeasurementSerializer(measurements, many=True)
        return Response(serializer.data)

class LocationRiskView(APIView):
    """GET /api/locations/{id}/risk - Output adhering strictly to Shared Data Contract."""
    def get(self, request, loc_id):
        location = get_object_or_404(Location, pk=loc_id)
        pred = RiskPrediction.objects.filter(location=location).order_by('-timestamp').first()
        
        if not pred:
            return Response({"error": "No prediction available for this location."}, status=status.HTTP_404_NOT_FOUND)
            
        anomalies = Anomaly.objects.filter(location=location, timestamp=pred.timestamp)
        action = RecommendedAction.objects.filter(prediction=pred).first()
        
        # Shared Data Contract JSON output format (Section 7)
        payload = {
            "location_id": location.id,
            "risk_type": pred.risk_type,
            "risk_probability": pred.risk_probability,
            "severity": pred.severity,
            "forecast_window_days": pred.forecast_window_days,
            "confidence": pred.confidence,
            "anomalies": [
                {
                    "variable": a.variable,
                    "description": a.description,
                    "severity": a.severity
                } for a in anomalies
            ],
            "drivers": pred.drivers,
            "recommended_action": action.action_text if action else "No immediate action required"
        }
        return Response(payload)

class AlertListView(APIView):
    """GET /api/alerts - List all unread system alerts for Baruch's UI."""
    def get(self, request):
        alerts = Alert.objects.filter(is_read=False).order_by('-timestamp')
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)


@api_view(["GET"])
def get_latest_location_risk(request, location_id):
    """Return the newest persisted risk prediction for one location."""
    try:
        prediction = (
            RiskPrediction.objects.filter(location_id=location_id)
            .order_by("-timestamp")
            .first()
        )
        if prediction is None:
            return Response(
                {"detail": "No risk prediction is available for this location."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(RiskPredictionSerializer(prediction).data)
    except Exception:
        logger.exception(
            "Unable to retrieve the latest risk prediction for location_id=%s.",
            location_id,
        )
        return Response(
            {"detail": "Unable to retrieve the latest risk prediction."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
