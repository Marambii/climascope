from django.urls import path
from .views import (
    LocationListView, 
    LocationDetailView, 
    LocationMeasurementsView, 
    LocationRiskView, 
    AlertListView,
    get_latest_location_risk,
)

urlpatterns = [
    path('locations/', LocationListView.as_view(), name='location-list'),
    path('locations/<int:loc_id>/', LocationDetailView.as_view(), name='location-detail'),
    path('locations/<int:loc_id>/measurements/', LocationMeasurementsView.as_view(), name='location-measurements'),
    path('locations/<int:loc_id>/risk/', LocationRiskView.as_view(), name='location-risk'),
    path(
        'locations/<int:location_id>/risk/latest/',
        get_latest_location_risk,
        name='latest-location-risk',
    ),
    path('alerts/', AlertListView.as_view(), name='alert-list'),
]
