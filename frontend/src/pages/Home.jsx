import { useState, useEffect, useRef, useMemo } from "react"
import { Link } from "react-router-dom"
import ProductDetail from "./ProductDetail.jsx"

export const CART_KEY = "tienda_cart"

async function getActiveProducts() {
  try {
    const res = await fetch("http://localhost:8000/api/variants/active", {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener productos")
    const data = await res.json()
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

async function getFeaturedProducts() {
  try {
    const res = await fetch("http://localhost:8000/api/variants/active", {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener productos destacados")
    const data = await res.json()
    if (Array.isArray(data)) {
      return data.filter(v => v.featured && v.active)
    }
    return []
  } catch (e) {
    console.error(e.message)
    return []
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]")
  } catch {
    return []
  }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}

/* ---------------- ICONOS ---------------- */

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

function ChevronIcon({ direction }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left"
        ? <polyline points="15 18 9 12 15 6"/>
        : <polyline points="9 18 15 12 9 6"/>}
    </svg>
  )
}

function FilterSelect({ value, onChange, options, placeholder }) {
  const hasValue = value !== ""
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-[42px] pl-3 pr-8 text-sm rounded-xl border transition-all outline-none cursor-pointer
          ${hasValue
            ? "bg-orange-500 border-orange-500 text-white font-semibold"
            : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${hasValue ? "text-white" : "text-slate-400"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  )
}

/* ---------------- FEATURED CARD ---------------- */

function FeaturedCard({ variant, cart, setCart, onViewDetail }) {
  const [qty, setQty] = useState(1)
  const cartItem = cart.find((c) => c.id === variant.id)
  const productName = variant.product_name

  function handleAdd(e) {
    e.stopPropagation()
    setCart((prev) => {
      const existing = prev.find((c) => c.id === variant.id)
      const next = existing
        ? prev.map((c) => c.id === variant.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { id: variant.id, sku: variant.sku, product_name: productName, price: variant.price, qty }]
      persistCart(next)
      return next
    })
  }

  return (
    <div className="w-72 shrink-0 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      <div
        className="relative bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-orange-300 cursor-pointer h-60"
        onClick={() => onViewDetail(productName, [variant])}
      >
        <ProductIcon name={productName} size={44} />
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Destacado
          </span>
        </div>
        <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              <EyeIcon /> Ver detalle
            </span>
          </div>
        </div>
        {cartItem && (
          <div className="absolute bottom-2 left-0 right-0 flex flex-wrap gap-1 justify-center px-2">
            <span className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-md font-mono">
              {variant.sku.split("-").slice(-1)[0]} ×{cartItem.qty}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-slate-800 leading-snug cursor-pointer hover:text-orange-500 transition-colors text-sm"
            onClick={() => onViewDetail(productName, [variant])}
          >
            {productName}
          </h3>
          <button onClick={() => onViewDetail(productName, [variant])} className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors" title="Ver detalle">
            <EyeIcon />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">{variant.sku}</span>
          <span className="font-extrabold text-orange-500 text-lg">${parseFloat(variant.price).toFixed(2)}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }} className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">−</button>
            <span className="w-6 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }} className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">+</button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold py-2 rounded-xl transition-all"
          >
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

/* ---------------- FEATURED CAROUSEL ---------------- */

function FeaturedCarousel({ featured, cart, setCart, onViewDetail }) {
  const scrollRef = useRef(null)
  if (featured.length === 0) return null

  function scroll(dir) {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Productos Destacados</h2>
          <p className="text-slate-400 text-xs mt-0.5">{featured.length} variantes seleccionadas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-all">
            <ChevronIcon direction="left" />
          </button>
          <button onClick={() => scroll("right")} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-all">
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {featured.map((variant) => (
          <FeaturedCard key={variant.id} variant={variant} cart={cart} setCart={setCart} onViewDetail={onViewDetail} />
        ))}
      </div>
      <div className="mt-6 border-t border-slate-100" />
    </div>
  )
}

/* ---------------- PRODUCT CARD ---------------- */

function ProductCard({ name, variants, cart, setCart, compact, onViewDetail }) {
  const [selected, setSelected] = useState(variants[0])
  const [qty, setQty] = useState(1)
  const cartItem = cart.find((c) => c.id === selected.id)

  function handleAdd(e) {
    e.stopPropagation()
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      <div
        className={`relative bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300 cursor-pointer ${compact ? "h-40" : "h-52"}`}
        onClick={() => onViewDetail(name, variants)}
      >
        <ProductIcon name={name} size={compact ? 30 : 40} />
        <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              <EyeIcon /> Ver detalle
            </span>
          </div>
        </div>
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
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-bold text-slate-800 leading-snug cursor-pointer hover:text-orange-500 transition-colors ${compact ? "text-sm" : "text-base"}`}
            onClick={() => onViewDetail(name, variants)}
          >
            {name}
          </h3>
          <button onClick={() => onViewDetail(name, variants)} className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors" title="Ver detalle">
            <EyeIcon />
          </button>
        </div>
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
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">{selected.sku}</span>
          <span className={`font-extrabold text-orange-500 transition-all ${compact ? "text-base" : "text-xl"}`}>
            ${parseFloat(selected.price).toFixed(2)}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }} className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">−</button>
            <span className="w-7 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }} className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">+</button>
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

/* ---------------- HOME ---------------- */

export default function Home() {
  const [allGrouped, setAllGrouped] = useState({})
  const [grouped, setGrouped] = useState({})
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [cols, setCols] = useState(3)
  const [cart, setCart] = useState(loadCart)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [attributeTypeFilter, setAttributeTypeFilter] = useState("")
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    Promise.all([getFeaturedProducts(), getActiveProducts()]).then(([feat, active]) => {
      setFeatured(feat)
      setAllGrouped(active)
      setGrouped(active)
      setLoading(false)
    })
  }, [])

  const categories = useMemo(() => {
    const cats = new Set()
    Object.values(allGrouped).forEach((variants) => {
      variants.forEach((v) => { if (v.product?.category?.name) cats.add(v.product.category.name) })
    })
    return Array.from(cats).sort()
  }, [allGrouped])

  const attributeTypes = useMemo(() => {
    const types = new Set()
    Object.values(allGrouped).forEach((variants) => {
      variants.forEach((v) => { (v.attributes || []).forEach((a) => { if (a.type) types.add(a.type) }) })
    })
    return Array.from(types).sort()
  }, [allGrouped])

  useEffect(() => {
    const filtered = Object.entries(allGrouped).reduce((acc, [name, variants]) => {
      const matching = variants.filter((v) => {
        const catOk = !categoryFilter || v.product?.category?.name === categoryFilter
        const attrOk = !attributeTypeFilter || (v.attributes || []).some((a) => a.type === attributeTypeFilter)
        return catOk && attrOk
      })
      if (matching.length > 0) acc[name] = matching
      return acc
    }, {})
    setGrouped(filtered)
  }, [allGrouped, categoryFilter, attributeTypeFilter])

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

  const entries = Object.entries(grouped).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const hasFilters = categoryFilter || attributeTypeFilter

  const gridClass = cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

  return (
    <div>
      {/* Carrusel de destacados */}
      {!loading && (
        <FeaturedCarousel
          featured={featured}
          cart={cart}
          setCart={setCart}
          onViewDetail={(n, v) => setDetail({ name: n, variants: v })}
        />
      )}

      {/* Cabecera */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Productos</h1>
        <p className="text-slate-400 text-sm mt-0.5">{entries.length} productos disponibles</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[160px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[42px] pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {categories.length > 0 && (
          <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="Categoría" />
        )}

        {attributeTypes.length > 0 && (
          <FilterSelect value={attributeTypeFilter} onChange={setAttributeTypeFilter} options={attributeTypes} placeholder="Atributo" />
        )}

        {hasFilters && (
          <button
            onClick={() => { setCategoryFilter(""); setAttributeTypeFilter("") }}
            className="h-[42px] px-3.5 flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:text-orange-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Limpiar
          </button>
        )}

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Selector columnas */}
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
          {[3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCols(n)}
              className={`flex items-center gap-1.5 px-3.5 h-[42px] text-sm font-medium transition-all ${n === 4 ? "border-l border-slate-200" : ""} ${cols === n ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-orange-50 hover:text-orange-500"}`}
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

      {/* CTA personalizado */}
      <div className="relative mb-8 bg-white border border-orange-200 rounded-2xl p-5 flex items-center justify-between gap-4 overflow-hidden">

        {/* Icono decorativo de fondo */}
        <svg className="absolute right-24 opacity-[0.06] w-28 h-28 stroke-orange-500" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>

        <div className="flex items-center gap-4 z-10">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 stroke-orange-500" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 mb-0.5">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-xs text-slate-500">
              Pídenos cualquier cerradura, medida o instalación a medida.
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {["Medidas especiales", "Instalación urgente", "Presupuesto gratis"].map((tag) => (
                <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link
          to="/solicitud"
          className="z-10 flex-shrink-0 flex items-center gap-1.5 bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition"
        >
          Solicitar
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Chips de filtros activos */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categoryFilter && (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
              {categoryFilter}
              <button onClick={() => setCategoryFilter("")} className="hover:text-orange-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          )}
          {attributeTypeFilter && (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
              {attributeTypeFilter}
              <button onClick={() => setAttributeTypeFilter("")} className="hover:text-orange-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Grid de productos */}
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
              onViewDetail={(n, v) => setDetail({ name: n, variants: v })}
            />
          ))}
        </div>
      )}
    </div>
  )
}