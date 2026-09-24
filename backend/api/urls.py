from django.urls import path
from .views import (
    LocationListView, 
    LocationDetailView, 
    LocationMeasurementsView, 
    LocationRiskView, 
    AlertListView,
    get_active_locations,
    get_latest_location_risk,
    get_location_telemetry,
)

urlpatterns = [
    path('locations/', get_active_locations, name='active-location-list'),
    path('locations/<int:loc_id>/', LocationDetailView.as_view(), name='location-detail'),
    path('locations/<int:loc_id>/measurements/', LocationMeasurementsView.as_view(), name='location-measurements'),
    path(
        'locations/<int:location_id>/telemetry/',
        get_location_telemetry,
        name='location-telemetry',
    ),
    path('locations/<int:loc_id>/risk/', LocationRiskView.as_view(), name='location-risk'),
    path(
        'locations/<int:location_id>/risk/latest/',
        get_latest_location_risk,
        name='latest-location-risk',
    ),
    path('alerts/', AlertListView.as_view(), name='alert-list'),
]
