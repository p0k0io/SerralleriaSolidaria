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

  const imageUrl = variant.image_url ?? null
  const isFeatured = variant.featured ?? variant.destacado

  return (
    <div className="w-[268px] shrink-0 bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">

      {/* Imagen */}
      <div
        className="relative h-52 overflow-hidden cursor-pointer"
        style={!imageUrl ? { background: "linear-gradient(145deg, #f8f9fb 0%, #f1f3f7 50%, #fdf4ef 100%)" } : {}}
        onClick={() => onViewDetail(productName, [variant])}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        ) : (
          <>
            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px"
            }} />
            <div className="absolute inset-0 flex items-center justify-center text-orange-200/80">
              <ProductIcon name={productName} size={44} />
            </div>
          </>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />

        {isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm shadow-orange-200/50">
              Destacado
            </span>
          </div>
        )}

        {variant.stock_status && variant.stock_status !== "available" && (
          <div className="absolute top-3 right-3">
            <StockBadge status={variant.stock_status} tiny />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <span className="flex items-center gap-1.5 bg-white text-orange-500 text-[11px] font-bold px-3.5 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
            <EyeIcon /> Ver detalle
          </span>
        </div>

        {cartItem && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-[10px] bg-orange-500 text-white font-bold px-2.5 py-1 rounded-full font-mono shadow-md whitespace-nowrap">
              {(variant.sku ?? "").split("-").slice(-1)[0]} ×{cartItem.qty}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-slate-900 leading-snug cursor-pointer hover:text-orange-500 transition-colors text-[15px]"
            onClick={() => onViewDetail(productName, [variant])}
          >
            {productName}
          </h3>
          <button
            onClick={() => onViewDetail(productName, [variant])}
            className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors mt-0.5"
            title="Ver detalle"
          >
            <EyeIcon />
          </button>
        </div>

        <MetaPills product={product} tiny />

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] font-mono text-slate-300">{variant.sku}</span>
          <span className="font-extrabold text-orange-500 text-[17px] tracking-tight">
            {parseFloat(variant.price).toFixed(2)} €
          </span>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100/80">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0 bg-slate-50/50">
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)) }} className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">−</button>
            <span className="w-6 text-center text-[13px] font-bold text-slate-700 select-none">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1) }} className="w-7 h-8 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">+</button>
          </div>
          <button
            onClick={handleAdd}
            disabled={isUnavailable}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-all duration-150 shadow-sm shadow-orange-200/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <CartIcon size={12} />
            {isUnavailable ? "Sin stock" : cartItem ? `Añadir más (${cartItem.qty})` : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  )
}