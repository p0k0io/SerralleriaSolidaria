import { useState, useEffect } from "react"
import ProductDetail from "./ProductDetail.jsx"

export const CART_KEY = "tienda_cart"

async function getProductsByCategory() {
  try {
    const res = await fetch("http://localhost:8000/api/products", {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener productos")
    const data = await res.json()

    // Agrupar por categoría
    const grouped = data.reduce((acc, product) => {
      if (!product.active) return acc

      const categoryName = product.category?.name || 'Sin categoría'
      if (!acc[categoryName]) acc[categoryName] = []
      acc[categoryName].push(product)
      return acc
    }, {})

    return grouped
  } catch (e) {
    console.error(e.message)
    return {}
  }
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") }
  catch { return [] }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}

function ProductIcon({ name = "", size = 36 }) {
  const n = name.toLowerCase()
  const p = {
    xmlns: "http://www.w3.org/2000/svg", width: size, height: size,
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round"
  }

  if (n.includes("bomb"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  if (n.includes("escudo"))
    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  if (n.includes("cerradura"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>

  return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function ProductCard({ product, cart, setCart, onViewDetail }) {
  const activeVariants = product.variants.filter(v => v.active)
  if (activeVariants.length === 0) return null

  const [selected, setSelected] = useState(activeVariants[0])
  const [qty, setQty] = useState(1)

  const cartItem = cart.find((c) => c.id === selected.id)

  function handleAdd(e) {
    e.stopPropagation()
    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id)
      const next = existing
        ? prev.map((c) => c.id === selected.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { id: selected.id, sku: selected.sku, product_name: product.name, price: selected.price, qty, installation_requested: false }]
      persistCart(next)
      return next
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">

      <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300 cursor-pointer h-48"
           onClick={() => onViewDetail(product.name, activeVariants)}>
        <ProductIcon name={product.name} size={36} />

        <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              <EyeIcon /> Ver detalle
            </span>
          </div>
        </div>

        <div className="absolute bottom-2 left-0 right-0 flex flex-wrap gap-1 justify-center px-2">
          {activeVariants.map((v) => {
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

      <div className="flex flex-col flex-1 p-4 gap-3">

        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 leading-snug cursor-pointer hover:text-orange-500 transition-colors text-sm"
              onClick={() => onViewDetail(product.name, activeVariants)}>
            {product.name}
          </h3>
          <button onClick={() => onViewDetail(product.name, activeVariants)}
                  className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors" title="Ver detalle">
            <EyeIcon />
          </button>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Variante</p>
          <div className="flex flex-wrap gap-1.5">
            {activeVariants.map((v) => {
              const inCart = cart.find((c) => c.id === v.id)
              const isActive = selected.id === v.id
              return (
                <button key={v.id} onClick={() => { setSelected(v); setQty(1) }}
                        className={`relative text-xs font-mono px-2.5 py-1.5 rounded-xl border transition-all ${
                          isActive ? "bg-orange-500 border-orange-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                        }`}>
                  {v.sku.split("-").slice(-1)[0]}
                  {inCart && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border-2 border-white" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">{selected.sku}</span>
          <span className="font-extrabold text-orange-500 text-base">
            ${parseFloat(selected.price).toFixed(2)}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }} className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">−</button>
            <span className="w-6 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }} className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">+</button>
          </div>
          <button onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold py-2 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {cartItem ? `Añadir más (${cartItem.qty})` : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Categories() {
  const [groupedByCategory, setGroupedByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(loadCart)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    getProductsByCategory().then((data) => {
      setGroupedByCategory(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [detail])

  if (detail) {
    return (
      <ProductDetail
        name={detail.name}
        variants={detail.variants}
        onBack={() => setDetail(null)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Productos por Categoría</h1>
        <p className="mt-3 text-slate-500 text-sm sm:text-base leading-7">
          Explora nuestros productos organizados por categorías para encontrar fácilmente lo que necesitas.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-100 h-8 w-48 rounded-xl mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="bg-slate-100 rounded-xl h-48 mb-4" />
                    <div className="bg-slate-100 h-4 rounded w-3/4 mb-3" />
                    <div className="flex gap-1.5 mb-3">{[1,2,3].map((k) => <div key={k} className="bg-slate-100 h-7 w-12 rounded-xl" />)}</div>
                    <div className="bg-slate-100 h-9 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedByCategory).map(([categoryName, products]) => (
            <section key={categoryName}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                    </svg>
                  </div>
                  {categoryName}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cart={cart}
                    setCart={setCart}
                    onViewDetail={(n, v) => setDetail({ name: n, variants: v })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
