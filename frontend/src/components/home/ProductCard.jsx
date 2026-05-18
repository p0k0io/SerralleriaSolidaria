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

  const cartItem      = cart.find((c) => c.id === selected.id)
  const product       = selected.product
  const isPack        = Boolean(selected.pack)
  const isUnavailable = selected.stock_status === "out_of_stock"
  const imageUrl      = selected.image_url ?? selected.image ?? null

  async function saveCartToDatabase(item) {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      await fetch("http://localhost:8000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  async function handleAdd(e) {
    e.stopPropagation()
    const item = { id: selected.id, sku: selected.sku, product_name: name, price: selected.price, qty }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id)
      const next = existing
        ? prev.map((c) => c.id === selected.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, item]
      persistCart(next)
      return next
    })
    await saveCartToDatabase(item)
  }

  return (
    /*
      FIX: <article> semántico para cada producto — un lector de pantalla
           puede navegar entre artículos con atajos de teclado.
    */
    <article
      aria-label={`Producto: ${name}`}
      className="group relative bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        border:    "1px solid rgba(226,232,240,0.7)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow   = "0 4px 16px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)"
        e.currentTarget.style.borderColor = "rgba(203,213,225,0.9)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow   = "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)"
        e.currentTarget.style.borderColor = "rgba(226,232,240,0.7)"
      }}
    >

      {/* ── Image area ── */}
      {/*
        FIX: <button> en lugar de <div onClick> — es interactivo y necesita
             semántica correcta para teclado y lectores de pantalla.
             aria-label describe la acción.
      */}
      <button
        onClick={() => onViewDetail(name, variants)}
        aria-label={`Ver detalle de ${name}`}
        className={`relative overflow-hidden w-full ${compact ? "h-36" : "h-48"} cursor-pointer`}
        style={{
          background: "linear-gradient(150deg, #f8f9fb 0%, #f2f4f8 40%, #faf6f2 100%)",
          border: "none",
          padding: 0,
        }}
      >
        {/* Grain — decorativo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Imagen real o fallback */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Imagen de ${name}`}
            className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = "flex"
              }
            }}
          />
        ) : null}

        {/* Fallback icono — aria-hidden porque el button ya tiene aria-label */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          <span className="text-orange-200/70 transition-transform duration-500 group-hover:scale-105">
            <ProductIcon name={name} size={compact ? 26 : 34} />
          </span>
        </div>

        {/* Hover tint — decorativo */}
        <div aria-hidden="true" className="absolute inset-0 bg-orange-400/0 group-hover:bg-orange-400/[0.03] transition-colors duration-300" />

        {/* Stock badge */}
        {selected.stock_status && selected.stock_status !== "available" && (
          <div className="absolute top-2.5 left-2.5" aria-hidden="true">
            <StockBadge status={selected.stock_status} tiny />
          </div>
        )}

        {/* Cart in-cart indicator — aria-hidden, la info está en el botón de carrito */}
        <div aria-hidden="true" className="absolute bottom-2 left-0 right-0 flex flex-wrap gap-1 justify-center px-2">
          {variants.map((v) => {
            const ci = cart.find((c) => c.id === v.id)
            if (!ci) return null
            return (
              <span key={v.id} className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-md font-mono shadow-sm">
                {(v.sku ?? "").split("-").slice(-1)[0]} ×{ci.qty}
              </span>
            )
          })}
        </div>

        {/* Hover label — aria-hidden porque el button ya lo describe */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 flex items-center gap-1.5 bg-white/95 text-orange-500 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <EyeIcon aria-hidden="true" /> Ver detalle
          </span>
        </div>
      </button>

      {/* ── Body ── */}
      <div className={`flex flex-col flex-1 ${compact ? "p-3 gap-2" : "p-4 gap-3"}`}>

        <div className="flex items-start justify-between gap-2">
          {/*
            FIX: h2 (o h3 si hay h2 en el contexto padre) semántico para el nombre.
                 Esto ayuda a la navegación por headings del lector de pantalla.
          */}
          <h2
            className={`font-bold text-slate-800 leading-snug cursor-pointer hover:text-orange-500 transition-colors ${compact ? "text-[13px]" : "text-[15px]"}`}
            style={{ margin: 0 }}
          >
            <button
              onClick={() => onViewDetail(name, variants)}
              className="text-left hover:text-orange-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:rounded"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "inherit" }}
            >
              {name}
            </button>
          </h2>
          {/*
            FIX: Botón de ojo con aria-label descriptivo.
                 El icono SVG es decorativo (aria-hidden).
          */}
          <button
            onClick={() => onViewDetail(name, variants)}
            aria-label={`Ver detalle de ${name}`}
            className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:rounded"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <EyeIcon aria-hidden="true" focusable="false" />
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
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2" id={`variant-label-${selected.id}`}>
            Variante
          </p>
          {/*
            FIX: role="radiogroup" para el grupo de variantes.
                 Cada variante es un radio button semántico.
          */}
          <div
            role="radiogroup"
            aria-labelledby={`variant-label-${selected.id}`}
            className="flex flex-wrap gap-1.5"
          >
            {variants.map((v) => {
              const inCart   = cart.find((c) => c.id === v.id)
              const isActive = selected.id === v.id
              const unavail  = v.stock_status === "out_of_stock"
              const skuShort = (v.sku ?? "—").split("-").slice(-1)[0]

              return (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`Variante ${skuShort}${unavail ? ", sin stock" : ""}${inCart ? `, en carrito: ${inCart.qty}` : ""}`}
                  onClick={() => { setSelected(v); setQty(1) }}
                  disabled={unavail && !isActive}
                  className={`relative text-xs font-mono px-2.5 py-1.5 rounded-xl border transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-1 ${
                    isActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-100"
                      : unavail
                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-white border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  {skuShort}
                  {/* Indicadores visuales — aria-hidden porque el aria-label del botón ya los describe */}
                  {inCart && !isActive && (
                    <span aria-hidden="true" className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white" />
                  )}
                  {unavail && !isActive && (
                    <span aria-hidden="true" className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 border-2 border-white" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-300" aria-hidden="true">{selected.sku}</span>
          {/*
            FIX: El precio con texto accesible completo para lectores de pantalla.
          */}
          <span
            className={`font-extrabold text-orange-500 tracking-tight ${compact ? "text-[15px]" : "text-[19px]"}`}
            aria-label={`Precio: ${parseFloat(selected.price).toFixed(2)} euros`}
          >
            {parseFloat(selected.price).toFixed(2)} €
          </span>
        </div>

        <div className="flex-1" />

        {/* Add to cart */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100/80">
          {/*
            FIX: Los botones de cantidad con aria-label descriptivo
                 y aria-live para anunciar el cambio de cantidad.
          */}
          <div
            className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0"
            style={{ background: "rgba(248,250,252,0.8)" }}
            role="group"
            aria-label={`Cantidad de ${name}`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }}
              aria-label={`Reducir cantidad, actualmente ${qty}`}
              className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              <span aria-hidden="true">−</span>
            </button>
            {/*
              FIX: aria-live="polite" para que el lector anuncie el nuevo valor.
            */}
            <span
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Cantidad: ${qty}`}
              className="w-7 text-center text-sm font-bold text-slate-700 select-none"
            >
              {qty}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }}
              aria-label={`Aumentar cantidad, actualmente ${qty}`}
              className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={isUnavailable}
            aria-label={
              isUnavailable
                ? `${name} sin stock`
                : cartItem
                  ? `Añadir ${qty} más de ${name} al carrito (ya tienes ${cartItem.qty})`
                  : `Añadir ${qty} de ${name} al carrito`
            }
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold py-2 rounded-xl transition-all duration-150 shadow-sm shadow-orange-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
          >
            <CartIcon aria-hidden="true" focusable="false" size={12} />
            <span>
              {isUnavailable ? "Sin stock" : cartItem ? `Añadir más (${cartItem.qty})` : "Añadir al carrito"}
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}