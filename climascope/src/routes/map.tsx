import { createFileRoute } from '@tanstack/react-router';
import { EnvironmentalMap } from '../components/EnvironmentaalMap';


export const Route = createFileRoute('/map')({
  component: MapPage,
});

function MapPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Environmental Map</h2>
        <p className="text-slate-500 mt-1">Geospatial view of monitored Conduit stations.</p>
      </div>
      
      {/* Renders the map component centered on JKUAT coordinates */}
      <EnvironmentalMap />
    </div>
  );
}