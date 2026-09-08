import { createFileRoute } from '@tanstack/react-router';
import dummyData from '../data/dummyData.json';

export const Route = createFileRoute('/alerts')({
  component: AlertsPage,
});

function AlertsPage() {
  // Helper to generate soft pill badges that match the reference aesthetic
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
      case 'WARNING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'WATCH': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Action Centre</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Manage system alerts and your monitored watchlist.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-full transition-colors text-sm flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add to Watchlist
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Alerts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Alerts Panel */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Active Alerts</h3>
                <span className="bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1 rounded-full border border-slate-100">
                  {dummyData.anomalies.length} Pending
                </span>
            </div>
            
            <div className="flex flex-col gap-4">
              {dummyData.anomalies.map((anomaly, idx) => (
                <div key={idx} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-5 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className={`mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(anomaly.severity)}`}>
                        {anomaly.severity}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800 mb-0.5">
                        {dummyData.station_name}
                      </h4>
                      <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700 capitalize">{anomaly.variable.replace(/_/g, ' ')}:</span> {anomaly.description}
                      </p>
                    </div>
                  </div>
                  <button className="bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-medium py-2 px-5 rounded-full transition-colors whitespace-nowrap text-sm shadow-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Global Recommended Action Panel (Styled like the solid green Reminders card in image_0200fc.jpg) */}
          <div className="bg-emerald-800 p-7 rounded-3xl shadow-sm text-white flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center opacity-50">
              <span className="text-white text-lg leading-none transform -rotate-45">→</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-emerald-200 mb-1 uppercase tracking-wider">System Recommendation</h3>
              <p className="text-2xl font-bold tracking-tight">{dummyData.recommended_action}</p>
            </div>
            <button className="relative z-10 bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-3 px-6 rounded-full transition-colors whitespace-nowrap flex items-center justify-center gap-2 shadow-sm">
              <span className="text-lg leading-none">+</span> Execute Action
            </button>
          </div>
        </div>

        {/* Right Column: Watchlist */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Watchlist</h3>
                <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <span className="text-lg leading-none transform -rotate-45">→</span>
                </button>
            </div>
            
            {/* Watchlist Item Card */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{dummyData.station_name}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Location ID: {dummyData.location_id}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getSeverityBadge(dummyData.severity)}`}>
                  {dummyData.severity}
                </span>
              </div>
              
              <div className="space-y-3 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Risk Profile</span>
                  <span className="font-bold text-slate-800 capitalize">{dummyData.risk_type}</span>
                </div>
                <div className="w-full h-px bg-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Probability</span>
                  <span className="font-bold text-slate-800">{(dummyData.risk_probability * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <button className="mt-auto w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 px-4 rounded-full transition-colors text-sm">
                Remove Location
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}