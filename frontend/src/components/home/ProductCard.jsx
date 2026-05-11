import { useState } from "react"
import { persistCart } from "./cartUtils"
import { ProductIcon, EyeIcon, CartIcon } from "./icons"
import StockBadge from "./StockBadge"
import MetaPills from "./MetaPills"

export default function ProductCard({ name, variants, cart, setCart, compact, onViewDetail }) {
  const [selected, setSelected] = useState(variants[0])
  const [qty, setQty]           = useState(1)
  const cartItem                = cart.find((c) => c.id === selected.id)
  const product                 = selected.product
  const isPack                  = Boolean(selected.pack)
  const isUnavailable           = selected.stock_status === "out_of_stock"

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
      {/* Imagen */}
      <div
        className={`relative bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300 cursor-pointer ${compact ? "h-40" : "h-52"}`}
        onClick={() => onViewDetail(name, variants)}
      >
        <ProductIcon name={name} size={compact ? 30 : 40} />

        {selected.stock_status && selected.stock_status !== "available" && (
          <div className="absolute top-2 left-2">
            <StockBadge status={selected.stock_status} tiny />
          </div>
        )}

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
                {(v.sku ?? "").split("-").slice(-1)[0]} ×{ci.qty}
              </span>
            )
          })}
        </div>
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${compact ? "p-3 gap-2" : "p-4 gap-3"}`}>
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

        {!compact && !isPack && <MetaPills product={product} />}

        {isPack && !compact && selected.pack_description && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-sm text-slate-500">
            {selected.pack_description}
          </div>
        )}

        {isPack && (
          <div className="inline-flex items-center gap-2 text-xs text-orange-600 font-semibold uppercase tracking-[0.16em] mb-1">
            <span className="rounded-full bg-orange-100 px-2 py-1">Pack</span>
          </div>
        )}

        {/* Variantes */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Variante</p>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const inCart   = cart.find((c) => c.id === v.id)
              const isActive = selected.id === v.id
              const unavail  = v.stock_status === "out_of_stock"
              return (
                <button
                  key={v.id}
                  onClick={() => { setSelected(v); setQty(1) }}
                  className={`relative text-xs font-mono px-2.5 py-1.5 rounded-xl border transition-all ${
                    isActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : unavail
                        ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                        : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {(v.sku ?? "—").split("-").slice(-1)[0]}
                  {inCart && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border-2 border-white" />
                  )}
                  {unavail && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 border-2 border-white" title="Sin stock" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">{selected.sku}</span>
          <span className={`font-extrabold text-orange-500 transition-all ${compact ? "text-base" : "text-xl"}`}>
            {parseFloat(selected.price).toFixed(2)} €
          </span>
        </div>

        <div className="flex-1" />

        {/* Add to cart */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }} className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">−</button>
            <span className="w-7 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }} className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg">+</button>
          </div>
          <button
            onClick={handleAdd}
            disabled={isUnavailable}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CartIcon size={13} />
            {isUnavailable ? "Sin stock" : cartItem ? `Añadir más (${cartItem.qty})` : "Añadir al carrito"}
          </button>
        </div>
      </div>
    </div>
  )
}