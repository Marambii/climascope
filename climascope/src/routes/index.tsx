import { createFileRoute } from '@tanstack/react-router';
import dummyData from '../data/dummyData.json';
import { MetricCharts } from '../components/MetricCharts'; 

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const data = dummyData;

  // Dynamic styling based on severity output from the ML pipeline
  const severityStyles = {
    NORMAL: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    WATCH: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    WARNING: 'bg-orange-100 border-orange-300 text-orange-800',
    CRITICAL: 'bg-red-100 border-red-300 text-red-800',
    HIGH: 'bg-red-100 border-red-300 text-red-800'
  };

  const currentSeverityColor = severityStyles[data.severity as keyof typeof severityStyles] || 'bg-slate-100';

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{data.station_name}</h2>
          <p className="text-slate-500 mt-1">Location ID: {data.location_id}</p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Last Updated: {new Date(data.last_updated).toLocaleString()}
        </div>
      </header>

      {/* Intelligence Summary Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Risk Status Card */}
        <div className={`p-6 rounded-xl border-2 ${currentSeverityColor} flex flex-col justify-center`}>
          <h3 className="text-sm uppercase tracking-wider font-bold opacity-80 mb-2">Current Status</h3>
          <div className="text-4xl font-extrabold">{data.severity}</div>
          <div className="mt-2 text-lg font-medium">
            {data.risk_type.charAt(0).toUpperCase() + data.risk_type.slice(1)} Risk: {(data.risk_probability * 100).toFixed(0)}%
          </div>
        </div>

        {/* Explanation UI: Drivers & Anomalies */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm md:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Why is this location at risk?</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-2">Key Drivers</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                {data.drivers.map((driver, idx) => (
                  <li key={idx}>{driver}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-2">Detected Anomalies</h4>
              <ul className="space-y-2">
                {data.anomalies.map((anomaly, idx) => (
                  <li key={idx} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">{anomaly.variable}:</span> {anomaly.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Action Centre */}
      <section className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">Recommended Action</h3>
          <p className="text-slate-300">{data.recommended_action}</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors">
          Log Field Inspection
        </button>
      </section>
      
      {/* Placeholder for ECharts */}
        <MetricCharts/>
    
    </div>
  );
}