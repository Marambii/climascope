import { createFileRoute } from '@tanstack/react-router';
import dummyData from '../data/dummyData.json';
import { MetricCharts } from '../components/MetricCharts'; 
import { Leaf, ArrowUpRight, ShieldAlert, Activity, CalendarCheck, CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const data = dummyData;

  // Modern, high-contrast severity styles matching the premium emerald/teal aesthetic
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL': return 'bg-red-600 text-white shadow-lg shadow-red-900/20';
      case 'WARNING': return 'bg-orange-500 text-white shadow-lg shadow-orange-900/20';
      case 'WATCH': return 'bg-yellow-500 text-white shadow-lg shadow-yellow-900/20';
      default: return 'bg-teal-800 text-white shadow-lg shadow-teal-900/20';
    }
  };

  const currentSeverityStyle = getSeverityStyle(data.severity);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto animate-fade-in font-sans pb-12">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Node ID: {data.location_id}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Leaf className="w-8 h-8 text-teal-600" />
            {data.station_name}
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Predictive Environmental Intelligence & Early Warning System[cite: 1, 3]
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-6 rounded-full transition-colors text-sm shadow-sm flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Log Inspection
          </button>
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-6 rounded-full transition-colors text-sm shadow-sm text-slate-600">
            Updated: {new Date(data.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </button>
        </div>
      </header>

      {/* Top Row: 4-Column Location Details & Core Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Current Status Card */}
        <div className={`p-6 rounded-3xl ${currentSeverityStyle} flex flex-col relative overflow-hidden`}>
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">Environmental Status</span>
          <div className="text-4xl font-black tracking-tight mb-3">{data.severity}</div>
          <div className="mt-auto inline-flex items-center gap-1.5 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
            Live Conduit Feed[cite: 1]
          </div>
        </div>

        {/* 2. Risk Probability Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 bg-slate-50">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Probability</span>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {(data.risk_probability * 100).toFixed(0)}%
          </div>
          <div className="mt-auto text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full w-fit capitalize border border-teal-100">
            {data.risk_type} Stress Risk[cite: 1]
          </div>
        </div>

        {/* 3. Forecast Window Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 bg-slate-50">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Forecast Window</span>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {data.forecast_window_days} <span className="text-lg font-normal text-slate-400">Days</span>
          </div>
          <div className="mt-auto text-xs font-medium text-slate-500">
            Predicted horizon trajectory[cite: 1]
          </div>
        </div>

        {/* 4. Model Confidence Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 bg-slate-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Model Confidence</span>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {(data.confidence * 100).toFixed(0)}%
          </div>
          <div className="mt-auto text-xs font-medium text-slate-500">
            Statistical fingerprint certainty[cite: 1]
          </div>
        </div>

      </section>

      {/* Middle Row: Explainability & Action Centre */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Explanation UI: Drivers & Anomalies */}
        <div className="p-7 rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Why is this location at risk?[cite: 1]
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Environmental Drivers</h4>
                <ul className="space-y-2.5">
                  {data.drivers.map((driver, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detected Anomalies</h4>
                <ul className="space-y-3">
                  {data.anomalies.map((anomaly, idx) => (
                    <li key={idx} className="text-sm flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 capitalize flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {anomaly.variable.replace(/_/g, ' ')}
                      </span> 
                      <span className="text-slate-500 text-xs pl-3">{anomaly.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Centre Panel */}
        <div className="p-7 rounded-3xl bg-teal-900 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-800/40 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal-300" />
              <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Recommended Action[cite: 1]</span>
            </div>
            <h4 className="text-2xl font-bold text-white leading-snug mb-3">
              {data.recommended_action}
            </h4>
            <p className="text-xs text-teal-200/80 font-medium">
              Triggered automatically by the decision engine based on current telemetry[cite: 1].
            </p>
          </div>

          <button className="mt-6 bg-white hover:bg-teal-50 text-teal-950 font-bold py-3.5 px-6 rounded-full transition-colors w-full flex justify-center items-center gap-2 shadow-sm text-sm">
            <span>Execute Field Inspection</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </section>
      
      {/* Visualizations Space: Historical Trends & Measurements */}
      <div className="p-7 rounded-3xl border border-slate-100 bg-white shadow-sm w-full">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Environmental Trajectory & Trends</h3>
        <p className="text-sm text-slate-500 mb-6">Visualizing sensor shifts across recent 16-minute interval telemetry feeds[cite: 1].</p>
        <MetricCharts />
      </div>
    
    </div>
  );
}