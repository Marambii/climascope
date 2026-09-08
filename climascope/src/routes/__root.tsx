import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-emerald-400 mb-8 tracking-tight">
          ClimaScope
        </h1>
        <nav className="flex flex-col gap-4">
          <Link to="/" className="font-semibold hover:text-emerald-300 [&.active]:text-emerald-400">
            Dashboard
          </Link>
          <div className="text-slate-500 cursor-not-allowed">Environmental Map</div>
          <div className="text-slate-500 cursor-not-allowed">Alerts</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  ),
});