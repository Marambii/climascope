import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import dummyData from '../data/dummyData.json';

export function EnvironmentalMap() {
  // JKUAT Conduit Coordinates
  const position: [number, number] = [-1.0963, 37.0125];

  // Dynamic styling based on severity (Normal, Watch, Warning, Critical)
  const severityColors = {
    NORMAL: '#10b981', // emerald-500
    WATCH: '#eab308',  // yellow-500
    WARNING: '#f97316', // orange-500
    CRITICAL: '#ef4444', // red-500
    HIGH: '#ef4444',     // red-500 mapping
  };

  const currentSeverityColor = severityColors[dummyData.severity as keyof typeof severityColors] || '#64748b';

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full">
      <h3 className="text-lg font-bold mb-4 text-slate-800">Monitored Locations</h3>
      <div className="h-96 w-full rounded-lg overflow-hidden border border-slate-200 z-0">
        <MapContainer 
          center={position} 
          zoom={15} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker
            center={position}
            pathOptions={{ color: currentSeverityColor, fillColor: currentSeverityColor, fillOpacity: 0.8 }}
            radius={14}
          >
            <Popup>
              <div className="font-sans min-w-[150px]">
                <strong className="block text-base text-slate-800">{dummyData.station_name}</strong>
                <div className="text-slate-500 text-sm mt-1">
                  Status: <span style={{ color: currentSeverityColor }} className="font-bold">{dummyData.severity}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-sm text-slate-700">
                  <span className="font-medium">Risk:</span> {(dummyData.risk_probability * 100).toFixed(0)}% ({dummyData.risk_type})
                </div>
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>
      </div>
    </section>
  );
}