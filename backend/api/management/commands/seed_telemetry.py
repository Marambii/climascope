"""Seed realistic Conduit-style telemetry for local development."""

from __future__ import annotations

import math
import random
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from api.models import (
    Anomaly,
    Location,
    RecommendedAction,
    RiskPrediction,
    SensorMeasurement,
)


class Command(BaseCommand):
    """Replace a location's telemetry with 50 simulated Conduit readings."""

    help = "Seed 50 historical telemetry readings at 16-minute intervals."

    reading_count = 50
    interval_minutes = 16

    def add_arguments(self, parser: object) -> None:
        """Expose the location ID while retaining Node 1 as the default."""
        parser.add_argument(
            "--location-id",
            type=int,
            default=1,
            help="Django Location ID to seed (default: 1).",
        )

    def handle(self, *args: object, **options: object) -> None:
        """Clear and create an ordered, plausible telemetry history."""
        location_id = options["location_id"]
        if not isinstance(location_id, int) or location_id <= 0:
            raise CommandError("--location-id must be a positive integer.")

        location, created = Location.objects.get_or_create(
            pk=location_id,
            defaults={
                "name": "Juja Main Sensor",
                "station_id": f"JUJA-MAIN-SENSOR-{location_id}",
                "latitude": -1.1018,
                "longitude": 37.0144,
                "region": "Juja",
                "is_active": True,
            },
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created default location: {location.name} (ID {location.pk})."
                )
            )

        deleted_count, _ = SensorMeasurement.objects.filter(location=location).delete()
        start_time = timezone.now() - timedelta(
            minutes=(self.reading_count - 1) * self.interval_minutes
        )
        measurements: list[SensorMeasurement] = []

        for index in range(self.reading_count):
            progress = index / (self.reading_count - 1)
            timestamp = start_time + timedelta(minutes=index * self.interval_minutes)
            temperature = (
                20.5
                + 4.0 * math.sin(progress * math.pi)
                + random.uniform(-0.5, 0.5)
            )
            humidity = (
                77.0
                - 12.0 * math.sin(progress * math.pi)
                + random.uniform(-2.0, 2.0)
            )
            soil_moisture = 34.0 - 1.5 * progress + random.uniform(-0.4, 0.4)
            rainfall = random.uniform(0.0, 0.8) if random.random() < 0.12 else 0.0
            pressure = 850.0 + random.uniform(-1.5, 1.5)
            wind_speed = max(0.0, random.gauss(2.2, 0.9))

            measurements.append(
                SensorMeasurement(
                    location=location,
                    timestamp=timestamp,
                    temperature=round(temperature, 2),
                    humidity=round(humidity, 2),
                    soil_moisture=round(soil_moisture, 2),
                    rainfall=round(rainfall, 2),
                    pressure=round(pressure, 2),
                    wind_speed=round(wind_speed, 2),
                )
            )

        SensorMeasurement.objects.bulk_create(measurements)
        self._create_default_risk_prediction(location)
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {deleted_count} existing telemetry records and seeded "
                f"{len(measurements)} readings for Location ID {location_id}."
            )
        )

    def _create_default_risk_prediction(self, location: Location) -> None:
        """Create development risk data only when ML output is not yet available."""
        if RiskPrediction.objects.filter(location=location).exists():
            return

        timestamp = timezone.now()
        prediction = RiskPrediction.objects.create(
            location=location,
            timestamp=timestamp,
            risk_type="drought",
            risk_probability=0.68,
            severity="WARNING",
            forecast_window_days=21,
            confidence=0.82,
            drivers=[
                "Low rainfall over the last seven days",
                "Declining soil-moisture levels",
                "Above-average daytime temperature",
            ],
        )
        RecommendedAction.objects.create(
            prediction=prediction,
            action_text=(
                "Inspect water availability and irrigation systems; schedule a "
                "field visit within 48 hours."
            ),
        )
        Anomaly.objects.create(
            location=location,
            timestamp=timestamp,
            variable="rainfall",
            description="Rainfall is below the expected seasonal baseline.",
            severity="HIGH",
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Created default risk prediction for Location ID {location.pk}."
            )
        )
