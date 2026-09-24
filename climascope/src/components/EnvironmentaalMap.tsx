import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { getRecommendedAction, useClimaScopeData } from '../hooks/useClimaScopeData';
import type { Location, SeverityLevel } from '../types/api';

export function EnvironmentalMap() {
  const { data, error, loading } = useClimaScopeData();

  if (loading) {
    return <div className="text-sm font-medium text-slate-500">Loading active locations…</div>;
  }

  if (error || data === null) {
    return <div className="text-sm font-medium text-red-600">{error ?? 'Map data is unavailable.'}</div>;
  }

  const { locations, risk } = data;
  const defaultPosition: [number, number] = [-1.100034, 37.0144];
  const position: [number, number] = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : defaultPosition;

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'WARNING': return '#ea580c';
      case 'WATCH': return '#ca8a04';
      default: return '#0d9488';
    }
  };

  const getBadgeStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
      case 'WARNING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'WATCH': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  const locationSeverity = (location: Location): SeverityLevel => (
    location.id === risk.location_id ? risk.severity : location.status ?? 'NORMAL'
  );

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative z-0">
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => {
          const severity = locationSeverity(location);
          const isSelectedLocation = location.id === risk.location_id;
          const severityColor = getSeverityColor(severity);
          const badgeStyle = getBadgeStyle(severity);
          const markerPosition: [number, number] = [
            location.latitude,
            location.longitude,
          ];

          return (
            <CircleMarker
              key={location.id}
              center={markerPosition}
              pathOptions={{
                color: severityColor,
                fillColor: severityColor,
                fillOpacity: 0.85,
                weight: 3,
              }}
              radius={16}
            >
              <Popup className="custom-popup">
                <div className="font-sans min-w-[260px] p-2 space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <strong className="block text-base text-slate-900 leading-tight">
                        {location.name}
                      </strong>
                      <span className="text-xs text-slate-400 font-medium">ID: {location.id}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeStyle}`}>
                      {severity}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Risk Profile</span>
                      <span className="font-bold text-slate-800 capitalize">{isSelectedLocation ? risk.risk_type : 'Pending'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Probability</span>
                      <span className="font-bold text-slate-800">{isSelectedLocation ? `${(risk.risk_probability * 100).toFixed(0)}%` : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Forecast Window</span>
                      <span className="font-bold text-slate-800">{isSelectedLocation ? `${risk.forecast_window_days} Days` : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Confidence</span>
                      <span className="font-bold text-slate-800">{isSelectedLocation ? `${(risk.confidence * 100).toFixed(0)}%` : '—'}</span>
                    </div>
                  </div>

                  {isSelectedLocation && risk.anomalies.length > 0 && (
                    <div className="text-xs text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-700 uppercase tracking-wider block">Key Anomaly:</span>
                      <p className="bg-red-50/50 text-red-700 p-2 rounded-xl border border-red-100">
                        {risk.anomalies[0].description}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => alert(`Navigating to deep-dive for station ${location.id}: ${isSelectedLocation ? getRecommendedAction(risk) : 'risk data pending'}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-full transition-colors text-xs shadow-sm"
                  >
                    View Full Location Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
