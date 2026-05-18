import { useState } from "react"


import { persistCart } from "./cartUtils"
import { ProductIcon, EyeIcon, CartIcon } from "./icons"
import StockBadge from "./StockBadge"
import MetaPills from "./MetaPills"

export default function ProductCard({
  name,
  variants,
  cart,
  setCart,
  compact,
  onViewDetail,
}) {
  const [selected, setSelected] = useState(variants[0])
  const [qty, setQty]           = useState(1)

  const cartItem  = cart.find((c) => c.id === selected.id)
  const product   = selected.product
  const isPack    = Boolean(selected.pack)
  const isUnavailable = selected.stock_status === "out_of_stock"

  // Imagen real: el backend devuelve image_url (URL absoluta) o null
  const imageUrl = selected.image_url ?? selected.image ?? null

  /*
  |--------------------------------------------------------------------------
  | Guardar carrito en backend
  |--------------------------------------------------------------------------
  */
  async function saveCartToDatabase(item) {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await fetch("http://localhost:8000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variant_id:   item.id,
          sku:          item.sku,
          product_name: item.product_name,
          price:        item.price,
          qty:          item.qty,
        }),
      })
    } catch (error) {
      console.error("Error guardando carrito", error)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Añadir al carrito
  |--------------------------------------------------------------------------
  */
  async function handleAdd(e) {
    e.stopPropagation()

    const item = {
      id:           selected.id,
      sku:          selected.sku,
      product_name: name,
      price:        selected.price,
      qty,
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id)
      const next = existing
        ? prev.map((c) =>
            c.id === selected.id ? { ...c, qty: c.qty + qty } : c
          )
        : [...prev, item]

      persistCart(next)
      return next
    })

    await saveCartToDatabase(item)
  }

  return (
    <div
      className="group relative bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        border:     "1px solid rgba(226,232,240,0.7)",
        boxShadow:  "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow  = "0 4px 16px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)"
        e.currentTarget.style.borderColor = "rgba(203,213,225,0.9)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow  = "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)"
        e.currentTarget.style.borderColor = "rgba(226,232,240,0.7)"
      }}
    >

      {/* ── Image area ── */}
      <div
        className={`relative overflow-hidden cursor-pointer ${compact ? "h-36" : "h-48"}`}
        style={{
          background: "linear-gradient(150deg, #f8f9fb 0%, #f2f4f8 40%, #faf6f2 100%)",
        }}
        onClick={() => onViewDetail(name, variants)}
      >
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* ── IMAGEN REAL o FALLBACK ── */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Si la imagen falla, mostramos el fallback ocultando el img
              e.currentTarget.style.display = "none"
              e.currentTarget.nextSibling.style.display = "flex"
            }}
          />
        ) : null}

        {/* Fallback — icono genérico (siempre en DOM, oculto si hay imagen) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          <span className="text-orange-200/70 transition-transform duration-500 group-hover:scale-105">
            <ProductIcon name={name} size={compact ? 26 : 34} />
          </span>
        </div>

        {/* Hover tint */}
        <div className="absolute inset-0 bg-orange-400/0 group-hover:bg-orange-400/[0.03] transition-colors duration-300" />

        {/* Stock badge */}
        {selected.stock_status && selected.stock_status !== "available" && (
          <div className="absolute top-2.5 left-2.5">
            <StockBadge status={selected.stock_status} tiny />
          </div>
        )}

        {/* Cart in-cart indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex flex-wrap gap-1 justify-center px-2">
          {variants.map((v) => {
            const ci = cart.find((c) => c.id === v.id)
            if (!ci) return null
            return (
              <span
                key={v.id}
                className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-md font-mono shadow-sm"
              >
                {(v.sku ?? "").split("-").slice(-1)[0]} ×{ci.qty}
              </span>
            )
          })}
        </div>

        {/* Hover action */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 flex items-center gap-1.5 bg-white/95 text-orange-500 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <EyeIcon /> Ver detalle
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`flex flex-col flex-1 ${compact ? "p-3 gap-2" : "p-4 gap-3"}`}>

        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-bold text-slate-800 leading-snug cursor-pointer hover:text-orange-500 transition-colors ${compact ? "text-[13px]" : "text-[15px]"}`}
            onClick={() => onViewDetail(name, variants)}
          >
            {name}
          </h3>
          <button
            onClick={() => onViewDetail(name, variants)}
            className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors mt-0.5"
          >
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

        {/* Variants */}
        <div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Variante</p>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const inCart   = cart.find((c) => c.id === v.id)
              const isActive = selected.id === v.id
              const unavail  = v.stock_status === "out_of_stock"
              return (
                <button
                  key={v.id}
                  onClick={() => { setSelected(v); setQty(1) }}
                  className={`relative text-xs font-mono px-2.5 py-1.5 rounded-xl border transition-all duration-150 ${
                    isActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-100"
                      : unavail
                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-white border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  {(v.sku ?? "—").split("-").slice(-1)[0]}
                  {inCart && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white" />
                  )}
                  {unavail && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 border-2 border-white" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-300">{selected.sku}</span>
          <span className={`font-extrabold text-orange-500 tracking-tight ${compact ? "text-[15px]" : "text-[19px]"}`}>
            {parseFloat(selected.price).toFixed(2)} €
          </span>
        </div>

        <div className="flex-1" />

        {/* Add to cart */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100/80">
          <div
            className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0"
            style={{ background: "rgba(248,250,252,0.8)" }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }}
              className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-base"
            >
              −
            </button>
            <span className="w-7 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }}
              className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-base"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={isUnavailable}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold py-2 rounded-xl transition-all duration-150 shadow-sm shadow-orange-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <CartIcon size={12} />
            {isUnavailable ? "Sin stock" : cartItem ? `Añadir más (${cartItem.qty})` : "Añadir al carrito"}
          </button>
        </div>
      </div>
    </div>
  )
}