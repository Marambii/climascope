import os
import pandas as pd
import django
import sys
from django.utils.dateparse import parse_datetime

# Add backend root to path and initialize Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'climascope.settings')
django.setup()

from api.models import Location, SensorMeasurement

def ingest_conduit_csv(file_path):
    """Reads Conduit CSV export and populates Location + SensorMeasurement tables."""
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    df = pd.read_csv(file_path)
    df.dropna(subset=['station_id', 'timestamp'], inplace=True)
    
    count = 0
    for _, row in df.iterrows():
        location, _ = Location.objects.get_or_create(
            station_id=str(row['station_id']),
            defaults={
                'name': row.get('location_name', f"Station {row['station_id']}"),
                'latitude': float(row.get('latitude', 0.0)),
                'longitude': float(row.get('longitude', 0.0)),
                'region': str(row.get('region', 'Kenya'))
            }
        )
        
        parsed_ts = parse_datetime(str(row['timestamp']))
        if not parsed_ts:
            continue
            
        SensorMeasurement.objects.update_or_create(
            location=location,
            timestamp=parsed_ts,
            defaults={
                'temperature': row.get('temperature'),
                'rainfall': row.get('rainfall'),
                'soil_moisture': row.get('soil_moisture'),
                'humidity': row.get('humidity')
            }
        )
        count += 1
    
    print(f"Successfully processed {count} measurement records into the database.")

if __name__ == '__main__':
    # Default path assumption for local testing
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'conduit_data.csv'
    ingest_conduit_csv(csv_file)
