import { useState } from "react"
import { CART_KEY } from "./Home"

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") }
  catch { return [] }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}



function ProductIcon({ name = "", size = 64 }) {
  const n = name.toLowerCase()
  const p = {
    xmlns: "http://www.w3.org/2000/svg", width: size, height: size,
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round"
  }

  if (n.includes("bomb"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  if (n.includes("escudo"))
    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  if (n.includes("cerradura"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>

  return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function CartIcon({ size = 15 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
    </svg>
  )
}

function StatBadge({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 min-w-[80px]">
      <span className="text-lg font-extrabold text-orange-500">{value}</span>
      <span className="text-[10px] font-semibold text-orange-300 uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  )
}


function VariantTable({ variants, selected, onSelect, cart }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">Ref.</th>
        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">SKU</th>
        <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">Precio</th>
        <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">En carrito</th>
            <th className="px-4 py-3"/>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => {
            const ref = v.sku.split("-").slice(-1)[0]
            const inCart = cart.find((c) => c.id === v.id)
            const isSelected = selected?.id === v.id
            return (
              <tr
                key={v.id}
                onClick={() => onSelect(v)}
                className={`cursor-pointer transition-colors border-b last:border-b-0 border-slate-50 ${
                  isSelected ? "bg-orange-50": "hover:bg-slate-50"}`}>
                <td className="px-4 py-3">
                  <span className={`font-mono font-bold text-sm ${isSelected ? "text-orange-600" : "text-slate-600"}`}>
                    {ref}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-400 text-xs">{v.sku}</td>
                <td className="px-4 py-3 text-right font-extrabold text-slate-800">
                  ${parseFloat(v.price).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  {inCart ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                      <CheckIcon /> {inCart.qty}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isSelected && (
                    <span className="text-orange-400">
                      <CheckIcon />
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


export default function ProductDetail({ name, variants, onBack }) {
  const [selected, setSelected] = useState(variants[0])
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState(loadCart)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const cartItem = cart.find((c) => c.id === selected.id)
  const totalInCart = cart.reduce((sum, c) => sum + c.qty, 0)
  const lowestPrice = Math.min(...variants.map((v) => parseFloat(v.price)))
  const highestPrice = Math.max(...variants.map((v) => parseFloat(v.price)))

  function handleAdd() {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id)
      const next = existing
        ? prev.map((c) => c.id === selected.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { id: selected.id, sku: selected.sku, product_name: name, price: selected.price, qty }]
      persistCart(next)
      return next
    })
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1800)
  }

  return (
    <div className="max-w-5xl mx-auto">

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-500 transition-colors mb-6 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">
          <ArrowLeftIcon />
        </span>
        Volver a productos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">


        <div className="lg:col-span-2 flex flex-col gap-4">

          <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl flex items-center justify-center text-orange-200 h-72 overflow-hidden">
    
            <div className="relative text-orange-300">
              <ProductIcon name={name} size={72} />
            </div>
            {/* Variantes en carrito */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 justify-end">
              {variants.map((v) => {
                const ci = cart.find((c) => c.id === v.id)
                if (!ci) return null
                return (
                  <span key={v.id} className="text-[11px] bg-orange-500 text-white font-bold px-2 py-1 rounded-lg font-mono shadow-sm">
                    {v.sku.split("-").slice(-1)[0]} ×{ci.qty}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 flex-wrap">
            <StatBadge label="Variantes" value={variants.length} />
            <StatBadge
              label="Precio"
              value={lowestPrice === highestPrice
                ? `$${lowestPrice.toFixed(2)}`
                : `$${lowestPrice.toFixed(0)}–${highestPrice.toFixed(0)}`
              }
            />
            <StatBadge label="En carrito" value={totalInCart} />
          </div>

          {/* Info card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1 text-sm">Sobre este producto</p>
            <p className="text-slate-400 text-xs">
              Selecciona una variante de la tabla o usa los botones de color para ver precio y SKU.
              Ajusta la cantidad y añade al carrito.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Nombre */}
          <div>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Producto</p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{name}</h1>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Variante seleccionada</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const ref = v.sku.split("-").slice(-1)[0]
                const inCart = cart.find((c) => c.id === v.id)
                const isActive = selected.id === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => { setSelected(v); setQty(1) }}
                    className={`relative text-sm font-mono px-4 py-2 rounded-xl border-2 transition-all ${
                      isActive
                        ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"
                        : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                    }`}
                  >
                    {ref}
                    {inCart && !isActive && (
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white shadow" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">SKU</p>
              <p className="font-mono text-slate-600 text-sm mt-0.5">{selected.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Precio unitario</p>
              <p className="text-3xl font-extrabold text-orange-500 mt-0.5">
                ${parseFloat(selected.price).toFixed(2)}
              </p>
            </div>
          </div>


          <div className="flex items-center gap-3">

            <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-12 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-xl font-light"
              >−</button>
              <span className="w-10 text-center text-base font-bold text-slate-700 select-none">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-11 h-12 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-xl font-light"
              >+</button>
            </div>

  
            <button
              onClick={handleAdd}
              className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 rounded-xl transition-all ${
                addedFeedback
                  ? "bg-green-500 scale-95"
                  : "bg-orange-500 hover:bg-orange-600 active:scale-95"
              }`}
            >
              {addedFeedback ? (
                <>
                  <CheckIcon /> ¡Añadido!
                </>
              ) : (
                <>
                  <CartIcon />
                  {cartItem
                    ? `Añadir más · ${cartItem.qty} en carrito`
                    : `Añadir al carrito · $${(parseFloat(selected.price) * qty).toFixed(2)}`
                  }
                </>
              )}
            </button>
          </div>

          {/* Tabla de variantes */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Todas las variantes
            </p>
            <VariantTable
              variants={variants}
              selected={selected}
              onSelect={(v) => { setSelected(v); setQty(1) }}
              cart={cart}
            />
          </div>
        </div>
      </div>
    </div>
  )
}