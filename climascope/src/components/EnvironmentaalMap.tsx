import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import dummyData from '../data/dummyData.json';
import type { ClimascopeResponse } from '../types/mockData';

export function EnvironmentalMap() {
  const data = dummyData as unknown as ClimascopeResponse;
  
  // Precise JKUAT Conduit Coordinates
  const position: [number, number] = [-1.100034, 37.014400];

  // Colour-coding mapping based on risk status severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL': return '#dc2626'; // red-600
      case 'WARNING': return '#ea580c'; // orange-600
      case 'WATCH': return '#ca8a04'; // yellow-600
      default: return '#0d9488'; // teal-600 (Normal)
    }
  };

  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
      case 'WARNING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'WATCH': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  const currentSeverityColor = getSeverityColor(data.severity);
  const badgeStyle = getBadgeStyle(data.severity);

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
        
        {/* Monitored Conduit Station Marker colour-coded by risk status */}
        <CircleMarker
          center={position}
          pathOptions={{ 
            color: currentSeverityColor, 
            fillColor: currentSeverityColor, 
            fillOpacity: 0.85, 
            weight: 3 
          }}
          radius={16}
        >
          {/* Interactive Popup showing full location details */}
          <Popup className="custom-popup">
            <div className="font-sans min-w-[260px] p-2 space-y-3">
              
              {/* Station Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div>
                  <strong className="block text-base text-slate-900 leading-tight">
                    {data.station_name}
                  </strong>
                  <span className="text-xs text-slate-400 font-medium">ID: {data.location_id}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeStyle}`}>
                  {data.severity}
                </span>
              </div>
              
              {/* Core Risk & Probability Metrics */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Risk Profile</span>
                  <span className="font-bold text-slate-800 capitalize">{data.risk_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Probability</span>
                  <span className="font-bold text-slate-800">{(data.risk_probability * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Forecast Window</span>
                  <span className="font-bold text-slate-800">{data.forecast_window_days} Days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Confidence</span>
                  <span className="font-bold text-slate-800">{(data.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Detected Anomalies & Drivers Summary */}
              {data.anomalies.length > 0 && (
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider block">Key Anomaly:</span>
                  <p className="bg-red-50/50 text-red-700 p-2 rounded-xl border border-red-100">
                    {data.anomalies[0].description}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => alert(`Navigating to deep-dive for station ${data.location_id}`)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-full transition-colors text-xs shadow-sm"
              >
                View Full Location Details
              </button>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}