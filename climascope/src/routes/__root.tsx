import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { LayoutDashboard, Map as MapIcon, Bell, Leaf } from 'lucide-react'; // Alias Map to MapIcon

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-950 text-white p-5 flex flex-col border-r border-slate-800/50 relative overflow-hidden">
        
        {/* Artistic Logo Section */}
        <div className="flex items-center gap-3 mb-10 mt-4 pl-2 relative z-10">
          <div className="bg-gradient-to-br from-teal-400 to-emerald-300 p-2.5 rounded-2xl shadow-lg shadow-teal-900/20">
            <Leaf className="w-6 h-6 text-slate-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-300 to-emerald-200 drop-shadow-sm">
            ClimaScope
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 relative z-10">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium text-slate-400 hover:text-teal-300 hover:bg-slate-900 transition-all [&.active]:text-teal-300 [&.active]:bg-teal-950/40 [&.active]:border [&.active]:border-teal-900/50 border border-transparent shadow-sm [&.active]:shadow-teal-900/10"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link 
            to="/map" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium text-slate-400 hover:text-teal-300 hover:bg-slate-900 transition-all [&.active]:text-teal-300 [&.active]:bg-teal-950/40 [&.active]:border [&.active]:border-teal-900/50 border border-transparent shadow-sm [&.active]:shadow-teal-900/10"
          >
            <MapIcon className="w-5 h-5" /> {/* Use MapIcon here */}
            Environmental Map
          </Link>
          
          <Link 
            to="/alerts" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium text-slate-400 hover:text-teal-300 hover:bg-slate-900 transition-all [&.active]:text-teal-300 [&.active]:bg-teal-950/40 [&.active]:border [&.active]:border-teal-900/50 border border-transparent shadow-sm [&.active]:shadow-teal-900/10"
          >
            <Bell className="w-5 h-5" />
            Alerts
          </Link>
        </nav>
        
        {/* Artistic Footer / Status Indicator */}
        <div className="mt-auto p-5 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800/50 text-xs text-slate-400 relative z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            <span className="font-semibold text-slate-300 tracking-wide uppercase">System Active</span>
          </div>
          Predictive Environmental Intelligence platform monitoring active nodes[cite: 3].
        </div>
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-teal-900/10 blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8 relative z-0">
        <Outlet />
      </main>
    </div>
  ),
});