from django.db import models

class Location(models.Model):
    """Stores information about geographical monitoring stations."""
    name = models.CharField(max_length=255)
    station_id = models.CharField(max_length=100, unique=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    region = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.station_id})"

class SensorMeasurement(models.Model):
    """Stores raw telemetry ingested from Conduit platform or CSV."""
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='measurements')
    timestamp = models.DateTimeField()
    temperature = models.FloatField(null=True, blank=True)
    rainfall = models.FloatField(null=True, blank=True)
    soil_moisture = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

class EnvironmentalBaseline(models.Model):
    """Seasonal normal values for environmental fingerprinting."""
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    month = models.IntegerField()
    avg_temperature = models.FloatField()
    avg_rainfall = models.FloatField()
    avg_soil_moisture = models.FloatField()

class EnvironmentalFeature(models.Model):
    """Calculated ML features over rolling windows (7d, 30d)."""
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    rainfall_7d_avg = models.FloatField()
    rainfall_30d_avg = models.FloatField()
    soil_moisture_decline_rate = models.FloatField()
    temp_anomaly = models.FloatField()

class Anomaly(models.Model):
    """Detected parameter deviations from baselines."""
    SEVERITY_CHOICES = [('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')]
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    variable = models.CharField(max_length=50)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)

class RiskPrediction(models.Model):
    """Predicted drought/environmental risk outputs from ML model."""
    SEVERITY_CHOICES = [('NORMAL', 'Normal'), ('WATCH', 'Watch'), ('WARNING', 'Warning'), ('CRITICAL', 'Critical')]
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    risk_type = models.CharField(max_length=50, default='drought')
    risk_probability = models.FloatField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    forecast_window_days = models.IntegerField(default=21)
    confidence = models.FloatField()
    drivers = models.JSONField()

class Alert(models.Model):
    """System generated warnings for high severity risks."""
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    severity = models.CharField(max_length=10)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

class FieldInspection(models.Model):
    """Tasks triggered for human action in high risk locations."""
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    inspector_name = models.CharField(max_length=255)
    notes = models.TextField()
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

class RecommendedAction(models.Model):
    """Actionable advice linked to a specific Risk Prediction."""
    prediction = models.OneToOneField(RiskPrediction, on_delete=models.CASCADE)
    action_text = models.TextField()
