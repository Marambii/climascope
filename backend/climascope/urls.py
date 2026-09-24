from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    """Return service metadata and discovery links for the ClimaScope API."""
    return JsonResponse(
        {
            "status": "operational",
            "service": "ClimaScope Telemetry API",
            "version": "1.0",
            "endpoints": {
                "locations": request.build_absolute_uri("api/locations/"),
                "telemetry": request.build_absolute_uri("api/telemetry/"),
            },
            "documentation": (
                "Append /api/locations/ or /api/telemetry/ to fetch active "
                "node readings."
            ),
        }
    )

urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
