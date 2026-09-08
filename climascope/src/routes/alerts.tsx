import { createFileRoute } from '@tanstack/react-router';
import dummyData from '../data/dummyData.json';
import { useState } from 'react';
import { Bell, ShieldAlert, BookmarkPlus, BookmarkCheck, ArrowUpRight, Filter } from 'lucide-react';

export const Route = createFileRoute('/alerts')({
  component: AlertsPage,
});

function AlertsPage() {
  // Local state for watchlist and active filter/read states to make the UI reactive
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'WATCH'>('ALL');
  
  // Extend dummyData anomalies to include stateful read/unread tracking
  const [anomalies, setAnomalies] = useState(
    dummyData.anomalies.map((anomaly, idx) => ({
      id: `anomaly-${idx}`,
      ...anomaly,
      read: idx % 2 === 0, // Alternate read status for demo realism
      timestamp: dummyData.last_updated
    }))
  );

  const toggleRead = (id: string) => {
    setAnomalies(prev => 
      prev.map(item => item.id === id ? { ...item, read: !item.read } : item)
    );
  };

  const filteredAnomalies = anomalies.filter(item => {
    if (filter === 'ALL') return true;
    return item.severity === filter;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
      case 'WARNING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'WATCH': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in font-sans pb-12 flex flex-col gap-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-teal-600" />
              Action Centre & Incident Response
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Alerts & Watchlist</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage system-wide environmental stress notifications, review active anomalies, and control tracked node watchlists.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOnWatchlist(!isOnWatchlist)}
            className={`font-medium py-2.5 px-6 rounded-full transition-colors text-sm flex items-center gap-2 shadow-sm border ${
              isOnWatchlist 
                ? 'bg-teal-900 text-white border-teal-900' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {isOnWatchlist ? <BookmarkCheck className="w-4 h-4 text-teal-300" /> : <BookmarkPlus className="w-4 h-4 text-slate-500" />}
            {isOnWatchlist ? 'Node on Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Alerts & Filters (Spans 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Controls / Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 ml-1" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Severity:</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {(['ALL', 'CRITICAL', 'WARNING', 'WATCH'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    filter === lvl 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-slate-900">Active Conduit Anomalies</h3>
              </div>
              <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">
                {filteredAnomalies.length} Pending Review
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              {filteredAnomalies.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No active anomalies match the selected severity filter.
                </div>
              ) : (
                filteredAnomalies.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex flex-col md:flex-row justify-between md:items-center gap-4 p-5 rounded-2xl border transition-all ${
                      item.read ? 'bg-slate-50/40 border-slate-100 opacity-75' : 'bg-white border-slate-200/80 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className={`mt-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900 leading-tight">
                            {dummyData.station_name}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-500" title="Unread Notice"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-800 capitalize">{item.variable.replace(/_/g, ' ')}:</span> {item.description}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                          Logged: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      <button 
                        onClick={() => toggleRead(item.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
                      >
                        {item.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button 
                        onClick={() => alert(`Opening deep-dive investigation panel for node ${dummyData.location_id}`)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-5 rounded-full transition-colors text-xs shadow-sm flex items-center gap-1.5"
                      >
                        View Evidence <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Recommended Action Card */}
          <div className="bg-teal-900 p-7 rounded-3xl shadow-md text-white flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-800/40 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <span className="text-xs font-semibold text-teal-300 mb-1 uppercase tracking-wider block">Decision Engine Directive</span>
              <p className="text-xl font-bold tracking-tight text-white">{dummyData.recommended_action}</p>
            </div>
            
            <button 
              onClick={() => alert('Field inspection workflow sequence initiated successfully.')}
              className="relative z-10 bg-white text-teal-950 hover:bg-teal-50 font-bold py-3 px-6 rounded-full transition-colors whitespace-nowrap flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <span>Execute Field Inspection</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Column: Monitored Watchlist Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Active Watchlist</h3>
                <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  1
                </span>
              </div>
              
              {/* Watchlist Item Card */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{dummyData.station_name}</h4>
                    <span className="text-xs text-slate-400 font-medium">Location ID: {dummyData.location_id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getSeverityBadge(dummyData.severity)}`}>
                    {dummyData.severity}
                  </span>
                </div>
                
                <div className="space-y-2.5 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100/80">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-xs">Risk Profile</span>
                    <span className="font-bold text-slate-800 capitalize text-xs">{dummyData.risk_type}</span>
                  </div>
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-xs">Probability</span>
                    <span className="font-bold text-slate-800 text-xs">{(dummyData.risk_probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-xs">Forecast Window</span>
                    <span className="font-bold text-slate-800 text-xs">{dummyData.forecast_window_days} Days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsOnWatchlist(false)}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 px-4 rounded-full transition-colors text-xs shadow-sm"
              >
                Manage Watchlist Settings
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}