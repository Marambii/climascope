import { createFileRoute } from '@tanstack/react-router';
import { EnvironmentalMap } from '../components/EnvironmentaalMap';
import { MapPin, SlidersHorizontal, Plus } from 'lucide-react';

export const Route = createFileRoute('/map')({
  component: MapPage,
});

function MapPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <MapPin className="w-8 h-8 text-teal-600" />
            Environmental Map
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Geospatial view of monitored Conduit stations across JKUAT campus nodes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-6 rounded-full transition-colors text-sm shadow-sm flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            Filter Nodes
          </button>
          <button className="bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-6 rounded-full transition-colors text-sm flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Station
          </button>
        </div>
      </header>
      
      {/* Container Card */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm w-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Station Network Status</h3>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              1 Active Node
            </span>
        </div>
        
        {/* Render Map Component with guaranteed dimensions */}
        <EnvironmentalMap />
      </div>

    </div>
  );
}