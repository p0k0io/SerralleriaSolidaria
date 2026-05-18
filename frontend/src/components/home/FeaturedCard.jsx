import { useState } from "react"
import { persistCart } from "./cartUtils"
import { ProductIcon, EyeIcon, CartIcon } from "./icons"
import StockBadge from "./StockBadge"
import MetaPills from "./MetaPills"

export default function FeaturedCard({ variant, cart, setCart, onViewDetail }) {
  const [qty, setQty]   = useState(1)
  const cartItem        = cart.find((c) => c.id === variant.id)
  const productName     = variant.product?.name ?? variant.product_name
  const product         = variant.product
  const isUnavailable   = variant.stock_status === "out_of_stock"
  const imageUrl        = variant.image_url ?? null
  const isFeatured      = variant.featured ?? variant.destacado

  function handleAdd(e) {
    e.stopPropagation()
    setCart((prev) => {
      const existing = prev.find((c) => c.id === variant.id)
      const next = existing
        ? prev.map((c) => c.id === variant.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { id: variant.id, sku: variant.sku, product_name: productName, price: variant.price, qty, installation_requested: false }]
      persistCart(next)
      return next
    })
  }

  return (
    /*
      FIX: <article> semántico para producto destacado.
    */
    <article
      aria-label={`Producto destacado: ${productName}`}
      className="w-[268px] shrink-0 bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
    >

      {/* ── Imagen ── */}
      {/*
        FIX: <button> en lugar de <div onClick>.
             aria-label describe la acción.
      */}
      <button
        onClick={() => onViewDetail(productName, [variant])}
        aria-label={`Ver detalle de ${productName}`}
        className="relative h-52 overflow-hidden w-full cursor-pointer"
        style={{
          ...((!imageUrl) ? { background: "linear-gradient(145deg, #f8f9fb 0%, #f1f3f7 50%, #fdf4ef 100%)" } : {}),
          border: "none",
          padding: 0,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Imagen de ${productName}`}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        ) : (
          <>
            {/* Noise — decorativo */}
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px"
            }} />
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-orange-200/80">
              <ProductIcon name={productName} size={44} />
            </div>
          </>
        )}

        {/* Overlay hover — decorativo */}
        <div aria-hidden="true" className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />

        {/* Badge destacado */}
        {isFeatured && (
          /*
            FIX: aria-hidden porque el contexto ya anuncia "Producto destacado"
                 en el aria-label del article.
          */
          <div aria-hidden="true" className="absolute top-3 left-3">
            <span className="inline-flex items-center bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm shadow-orange-200/50">
              Destacado
            </span>
          </div>
        )}

        {/* Stock badge */}
        {variant.stock_status && variant.stock_status !== "available" && (
          <div aria-hidden="true" className="absolute top-3 right-3">
            <StockBadge status={variant.stock_status} tiny />
          </div>
        )}

        {/* Hover label — aria-hidden */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <span className="flex items-center gap-1.5 bg-white text-orange-500 text-[11px] font-bold px-3.5 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
            <EyeIcon aria-hidden="true" /> Ver detalle
          </span>
        </div>

        {/* In-cart indicator — aria-hidden */}
        {cartItem && (
          <div aria-hidden="true" className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-[10px] bg-orange-500 text-white font-bold px-2.5 py-1 rounded-full font-mono shadow-md whitespace-nowrap">
              {(variant.sku ?? "").split("-").slice(-1)[0]} ×{cartItem.qty}
            </span>
          </div>
        )}
      </button>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          {/*
            FIX: h2 con button interno para mantener semántica de heading
                 y ser clicable correctamente.
          */}
          <h2
            className="font-bold text-slate-900 leading-snug text-[15px]"
            style={{ margin: 0 }}
          >
            <button
              onClick={() => onViewDetail(productName, [variant])}
              className="text-left hover:text-orange-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:rounded"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "inherit" }}
            >
              {productName}
            </button>
          </h2>
          {/*
            FIX: Botón de ojo con aria-label descriptivo.
          */}
          <button
            onClick={() => onViewDetail(productName, [variant])}
            aria-label={`Ver detalle de ${productName}`}
            className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:rounded"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <EyeIcon aria-hidden="true" focusable="false" />
          </button>
        </div>

        <MetaPills product={product} tiny />

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] font-mono text-slate-300" aria-hidden="true">{variant.sku}</span>
          <span
            className="font-extrabold text-orange-500 text-[17px] tracking-tight"
            aria-label={`Precio: ${parseFloat(variant.price).toFixed(2)} euros`}
          >
            {parseFloat(variant.price).toFixed(2)} €
          </span>
        </div>

        {/* Add to cart */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100/80">
          {/*
            FIX: Grupo de cantidad con aria-labels descriptivos.
          */}
          <div
            className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0 bg-slate-50/50"
            role="group"
            aria-label={`Cantidad de ${productName}`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }}
              aria-label={`Reducir cantidad, actualmente ${qty}`}
              className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              <span aria-hidden="true">−</span>
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Cantidad: ${qty}`}
              className="w-6 text-center text-[13px] font-bold text-slate-700 select-none"
            >
              {qty}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }}
              aria-label={`Aumentar cantidad, actualmente ${qty}`}
              className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={isUnavailable}
            aria-label={
              isUnavailable
                ? `${productName} sin stock`
                : cartItem
                  ? `Añadir ${qty} más de ${productName} al carrito (ya tienes ${cartItem.qty})`
                  : `Añadir ${qty} de ${productName} al carrito`
            }
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-all duration-150 shadow-sm shadow-orange-200/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
          >
            <CartIcon aria-hidden="true" focusable="false" size={12} />
            <span>
              {isUnavailable ? "Sin stock" : cartItem ? `Añadir más (${cartItem.qty})` : "Añadir"}
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}