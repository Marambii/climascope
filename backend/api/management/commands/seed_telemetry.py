"""Seed realistic Conduit-style telemetry for local development."""

from __future__ import annotations

import math
import random
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from api.models import Location, SensorMeasurement


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

        try:
            location = Location.objects.get(pk=location_id)
        except Location.DoesNotExist as exc:
            raise CommandError(f"Location with ID {location_id} does not exist.") from exc

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
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {deleted_count} existing telemetry records and seeded "
                f"{len(measurements)} readings for Location ID {location_id}."
            )
        )
