import { useState, useEffect } from "react"

// ── Constante compartida de clave ──────────────────────────────────────────────
export const CART_KEY = "tienda_cart"

// ── API ────────────────────────────────────────────────────────────────────────

async function getActiveProducts() {
  try {
    const res = await fetch("http://localhost:8000/api/variants/active", {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener productos")
    const data = await res.json()

    // Soporta array plano u objeto ya agrupado
    if (Array.isArray(data)) {
      return data.reduce((acc, v) => {
        if (!acc[v.product_name]) acc[v.product_name] = []
        acc[v.product_name].push(v)
        return acc
      }, {})
    }
    return data
  } catch (e) {
    console.error(e.message)
    return {}
  }
}

// ── localStorage ───────────────────────────────────────────────────────────────

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") }
  catch { return [] }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  // Dispara evento para que el nav se actualice sin recargar
  window.dispatchEvent(new Event("cart-updated"))
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function ProductIcon({ name = "", size = 36 }) {
  const n = name.toLowerCase()
  const p = { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" }

  if (n.includes("bomb"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  if (n.includes("escudo"))
    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  if (n.includes("cerradura"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>

  return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
}

// ── ProductCard ────────────────────────────────────────────────────────────────

function ProductCard({ name, variants, cart, setCart, compact }) {
  const [selected, setSelected] = useState(variants[0])
  const [qty, setQty] = useState(1)

  const cartItem = cart.find((c) => c.id === selected.id)

  function handleAdd() {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id)
      const next = existing
        ? prev.map((c) => c.id === selected.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { id: selected.id, sku: selected.sku, product_name: name, price: selected.price, qty }]
      persistCart(next)
      return next
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

      {/* Imagen */}
      <div className={`relative bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300 ${compact ? "h-40" : "h-52"}`}>
        <ProductIcon name={name} size={compact ? 30 : 40} />
        {/* badges de variantes en carrito */}
        <div className="absolute bottom-2 left-0 right-0 flex flex-wrap gap-1 justify-center px-2">
          {variants.map((v) => {
            const ci = cart.find((c) => c.id === v.id)
            if (!ci) return null
            return (
              <span key={v.id} className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-md font-mono">
                {v.sku.split("-").slice(-1)[0]} ×{ci.qty}
              </span>
            )
          })}
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${compact ? "p-3 gap-2.5" : "p-4 gap-3"}`}>

        {/* Nombre */}
        <h3 className={`font-bold text-slate-800 leading-snug ${compact ? "text-sm" : "text-base"}`}>
          {name}
        </h3>

        {/* Selector de variante */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Variante</p>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const inCart = cart.find((c) => c.id === v.id)
              const isActive = selected.id === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => { setSelected(v); setQty(1) }}
                  className={`relative text-xs font-mono px-2.5 py-1.5 rounded-xl border transition-all ${
                    isActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {v.sku.split("-").slice(-1)[0]}
                  {inCart && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border-2 border-white" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* SKU + precio */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">{selected.sku}</span>
          <span className={`font-extrabold text-orange-500 transition-all ${compact ? "text-base" : "text-xl"}`}>
            ${parseFloat(selected.price).toFixed(2)}
          </span>
        </div>

        <div className="flex-1" />

        {/* Cantidad + añadir */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">−</button>
            <span className="w-7 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">+</button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold py-2 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {cartItem ? `Añadir más (${cartItem.qty})` : "Añadir al carrito"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Home ───────────────────────────────────────────────────────────────────────

export default function Home() {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [cols, setCols] = useState(3)
  const [cart, setCart] = useState(loadCart)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getActiveProducts().then((data) => {
      setGrouped(data)
      setLoading(false)
    })
  }, [])

  const entries = Object.entries(grouped).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const gridClass = cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">{entries.length} productos disponibles</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
          {[3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCols(n)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all ${n === 4 ? "border-l border-slate-200" : ""} ${cols === n ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-orange-50 hover:text-orange-500"}`}
            >
              {n === 3
                ? <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="9.5" y="3" width="5" height="18" rx="1"/><rect x="16" y="3" width="5" height="18" rx="1"/></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="4.5" height="18" rx="1"/><rect x="7.8" y="3" width="4.5" height="18" rx="1"/><rect x="13.1" y="3" width="4.5" height="18" rx="1"/><rect x="18.4" y="3" width="3.6" height="18" rx="1"/></svg>
              }
              <span className="hidden sm:inline">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={`grid ${gridClass} gap-4`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="bg-slate-100 rounded-xl h-48 mb-4" />
              <div className="bg-slate-100 h-4 rounded w-3/4 mb-3" />
              <div className="flex gap-1.5 mb-3">{[1,2,3].map((j) => <div key={j} className="bg-slate-100 h-7 w-12 rounded-xl" />)}</div>
              <div className="bg-slate-100 h-9 rounded-xl" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-4`}>
          {entries.map(([name, variants]) => (
            <ProductCard
              key={name}
              name={name}
              variants={variants}
              cart={cart}
              setCart={setCart}
              compact={cols === 4}
            />
          ))}
        </div>
      )}
    </div>
  )
}