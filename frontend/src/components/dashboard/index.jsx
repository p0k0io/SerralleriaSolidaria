import { useEffect, useState } from "react";

const BASE = "http://localhost:8000";

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const URGENT_ORDERS = [
  { id: "PED-001", client: "Ferretería López", items: 3, due: "Hoy 14:00", level: "high" },
  { id: "PED-002", client: "Construcciones Roca", items: 7, due: "Hoy 17:00", level: "high" },
  { id: "PED-003", client: "Suministros Martín", items: 2, due: "Mañana 9:00", level: "medium" },
];

const levelStyle = {
  high:   { dot: "bg-red-500",   badge: "bg-red-100 text-red-600",     label: "Urgente" },
  medium: { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-600", label: "Prioritario" },
  low:    { dot: "bg-slate-300", badge: "bg-slate-100 text-slate-500", label: "Normal" },
};

const FAKE_STOCK = {
  7: 0,
  8: 2,
  9: 4,
  10: 1,
  11: 3,
  12: 0,
};

function getFakeStock(id) {
  if (FAKE_STOCK[id] !== undefined) return FAKE_STOCK[id];
  return id % 6;
}

const LOW_STOCK_THRESHOLD = 5;

export default function Dashboard() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/variants`)
      .then((r) => { if (!r.ok) throw new Error("Error al obtener variantes"); return r.json(); })
      .then((data) => {
        const withStock = data.map((v) => ({ ...v, stock: getFakeStock(v.id) }));
        setVariants(withStock);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const lowStock = variants.filter((v) => v.stock <= LOW_STOCK_THRESHOLD && v.active);

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Pedidos urgentes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-orange-500"><AlertIcon /></span>
            <h2 className="font-semibold text-slate-800 text-sm">Pedidos urgentes</h2>
          </div>
          <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            {URGENT_ORDERS.length} pendientes
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {URGENT_ORDERS.map((order) => {
            const style = levelStyle[order.level];
            return (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-medium truncate">{order.client}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{order.id} · {order.items} artículo{order.items !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs flex-shrink-0">
                  <ClockIcon />
                  <span>{order.due}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Poco stock */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-orange-500"><BoxIcon /></span>
            <h2 className="font-semibold text-slate-800 text-sm">Poco stock</h2>
          </div>
          {!loading && !error && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lowStock.length > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
              {lowStock.length > 0 ? `${lowStock.length} variante${lowStock.length !== 1 ? "s" : ""}` : "Todo OK"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span className="text-sm">Cargando variantes…</span>
          </div>
        ) : error ? (
          <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">⚠ {error}</div>
        ) : lowStock.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p className="text-sm">Todas las variantes tienen stock suficiente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {lowStock.map((v) => {
              const stockColor =
                v.stock === 0 ? "text-red-600 bg-red-100" :
                v.stock <= 2  ? "text-red-500 bg-red-50"  :
                                "text-amber-600 bg-amber-100";
              return (
                <div key={v.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                  {v.image ? (
                    <img
                      src={`${BASE}/${v.image}`}
                      alt={v.sku}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-medium truncate">{v.product?.name || "Producto"}</p>
                    <p className="text-slate-400 text-xs mt-0.5">SKU: {v.sku} · {v.price} €</p>
                  </div>

                  <div className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${stockColor}`}>
                    {v.stock === 0 ? "Sin stock" : `${v.stock} ud.`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}