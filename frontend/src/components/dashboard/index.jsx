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

const LOW_STOCK_THRESHOLD = 5;

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);
  const [errorVariants, setErrorVariants] = useState(null);

  useEffect(() => {
    // Obtener órdenes preparadas
    fetch(`${BASE}/api/orders/prepared`)
      .then((r) => { if (!r.ok) throw new Error("Error al obtener órdenes"); return r.json(); })
      .then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch((e) => { setErrorOrders(e.message); setLoadingOrders(false); });

    // Obtener variantes con bajo stock
    fetch(`${BASE}/api/variants`)
      .then((r) => { if (!r.ok) throw new Error("Error al obtener variantes"); return r.json(); })
      .then((data) => {
        setVariants(data);
        setLoadingVariants(false);
      })
      .catch((e) => { setErrorVariants(e.message); setLoadingVariants(false); });
  }, []);

  const lowStock = variants.filter((v) => {
    // Convertir stock_status a un número para comparar
    const stock = v.stock_status === "out_of_stock" ? 0 : v.stock_status === "next_batch" ? 2 : 10;
    return stock <= LOW_STOCK_THRESHOLD && v.active;
  });

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Pedidos preparados para enviar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-orange-500"><AlertIcon /></span>
            <h2 className="font-semibold text-slate-800 text-sm">Comandes preparades per enviar</h2>
          </div>
          {!loadingOrders && (
            <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              {orders.length} preparats
            </span>
          )}
        </div>

        {loadingOrders ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span className="text-sm">Cargando comandes…</span>
          </div>
        ) : errorOrders ? (
          <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">⚠ {errorOrders}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p className="text-sm">No hay comandes preparades</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {orders.map((order) => {
              const totalItems = order.items_count + order.services_count;
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-orange-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-medium truncate">{order.client}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {order.order_number} · {totalItems} article{totalItems !== 1 ? "s" : ""} ({order.items_count} product{order.items_count !== 1 ? "s" : ""} + {order.services_count} servici{order.services_count !== 1 ? "es" : "s"})
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">
                    {order.total_amount.toFixed(2)} €
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Poco stock */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-orange-500"><BoxIcon /></span>
            <h2 className="font-semibold text-slate-800 text-sm">Poc stock</h2>
          </div>
          {!loadingVariants && !errorVariants && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lowStock.length > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
              {lowStock.length > 0 ? `${lowStock.length} variante${lowStock.length !== 1 ? "s" : ""}` : "Tot OK"}
            </span>
          )}
        </div>

        {loadingVariants ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span className="text-sm">Cargando variantes…</span>
          </div>
        ) : errorVariants ? (
          <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">⚠ {errorVariants}</div>
        ) : lowStock.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p className="text-sm">Totes les variants tenen stock suficient</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {lowStock.map((v) => {
              const stockColor = v.stock_status === "out_of_stock" ? "text-red-600 bg-red-100" : "text-amber-600 bg-amber-100";
              const stockText = v.stock_status === "out_of_stock" ? "Sin stock" : v.stock_status === "next_batch" ? "Pròxim" : "Baix";
              return (
                <div key={v.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                  {v.image ? (
                    <img
                      src={`${BASE}/${v.image}`}
                      alt={v.sku}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-medium truncate">{v.product?.name || "Producte"}</p>
                    <p className="text-slate-400 text-xs mt-0.5">SKU: {v.sku} · {v.price} €</p>
                  </div>

                  <div className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${stockColor}`}>
                    {stockText}
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