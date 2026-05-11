import { useEffect, useState } from "react";

const BASE = "http://localhost:8000";

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/dashboard`)
      .then((r) => { if (!r.ok) throw new Error("Error al obtener datos del dashboard"); return r.json(); })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        <span className="text-sm">Cargando dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">⚠ {error}</div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

      {/* Ventas del día */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-500"><DollarIcon /></span>
            <h3 className="font-semibold text-slate-800 text-sm">Ventes del dia</h3>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-2">{dashboardData.today_sales.toFixed(2)} €</p>
      </div>

      {/* Pedidos pendientes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-500"><ClockIcon /></span>
            <h3 className="font-semibold text-slate-800 text-sm">Comandes pendents</h3>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-2">{dashboardData.pending_orders}</p>
      </div>

      {/* Productos activos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-500"><PackageIcon /></span>
            <h3 className="font-semibold text-slate-800 text-sm">Productes actius</h3>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-2">{dashboardData.active_products}</p>
      </div>

      {/* Productos más vendidos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-purple-500"><TrendingUpIcon /></span>
            <h2 className="font-semibold text-slate-800 text-sm">Productes més venuts (aquest mes)</h2>
          </div>
        </div>
        {dashboardData.top_products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <p className="text-sm">No hi ha dades de vendes</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {dashboardData.top_products.map((product, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-medium truncate">{product.name}</p>
                </div>
                <span className="text-xs font-semibold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full shrink-0">
                  {product.total_sold} venuts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}