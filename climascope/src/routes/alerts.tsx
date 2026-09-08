import { createFileRoute } from '@tanstack/react-router';
import dummyData from '../data/dummyData.json';

export const Route = createFileRoute('/alerts')({
  component: AlertsPage,
});

function AlertsPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">System Alerts</h2>
        <p className="text-slate-500 mt-1">Active anomaly detections and recommended actions.</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Map through detected anomalies to generate alert cards */}
        {dummyData.anomalies.map((anomaly, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {anomaly.severity}
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  {dummyData.station_name}
                </h3>
              </div>
              <p className="text-slate-700">
                <span className="font-semibold capitalize">{anomaly.variable.replace('_', ' ')}:</span> {anomaly.description}
              </p>
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded transition-colors">
              View Details
            </button>
          </div>
        ))}

        {/* Global Recommended Action Panel */}
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm mt-4">
          <h3 className="text-lg font-bold text-emerald-900 mb-2">Recommended Action</h3>
          <p className="text-emerald-800">{dummyData.recommended_action}</p>
        </div>
      </div>
    </div>
  );
}