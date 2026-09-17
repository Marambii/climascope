from django.urls import path
from .views import (
    LocationListView, 
    LocationDetailView, 
    LocationMeasurementsView, 
    LocationRiskView, 
    AlertListView
)

urlpatterns = [
    path('locations/', LocationListView.as_view(), name='location-list'),
    path('locations/<int:loc_id>/', LocationDetailView.as_view(), name='location-detail'),
    path('locations/<int:loc_id>/measurements/', LocationMeasurementsView.as_view(), name='location-measurements'),
    path('locations/<int:loc_id>/risk/', LocationRiskView.as_view(), name='location-risk'),
    path('alerts/', AlertListView.as_view(), name='alert-list'),
]
