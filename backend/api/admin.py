from django.contrib import admin
from .models import Location, SensorMeasurement, RiskPrediction, Anomaly, Alert

# Register models so you can manage them via Django Admin panel (/admin)
admin.site.register(Location)
admin.site.register(SensorMeasurement)
admin.site.register(RiskPrediction)
admin.site.register(Anomaly)
admin.site.register(Alert)
