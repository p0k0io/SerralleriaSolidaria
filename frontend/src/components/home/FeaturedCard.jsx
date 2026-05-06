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
        : [...prev, { id: variant.id, sku: variant.sku, product_name: productName, price: variant.price, qty }]
      persistCart(next)
      return next
    })
  }

  const imageUrl = variant.image || product?.image || null
  const isFeatured = variant.featured ?? variant.destacado

  return (
    <div className="w-72 shrink-0 bg-white rounded-3xl border border-amber-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      <div
        className="relative h-64 overflow-hidden cursor-pointer bg-slate-100"
        onClick={() => onViewDetail(productName, [variant])}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={productName} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ProductIcon name={productName} size={56} />
          </div>
        )}

        <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition-colors duration-200" />

        {isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
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
          <span className="flex items-center gap-1.5 bg-white/95 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
            <EyeIcon /> Ver detalle
          </span>
        </div>

        {cartItem && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-wrap gap-1 justify-center px-2">
            <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-1 rounded-full font-mono shadow-sm">
              {(variant.sku ?? "").split("-").slice(-1)[0]} ×{cartItem.qty}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-slate-900 leading-snug cursor-pointer hover:text-orange-500 transition-colors text-base"
            onClick={() => onViewDetail(productName, [variant])}
          >
            {productName}
          </h3>
          <button onClick={() => onViewDetail(productName, [variant])} className="shrink-0 text-slate-300 hover:text-orange-400 transition-colors" title="Ver detalle">
            <EyeIcon />
          </button>
        </div>

        <MetaPills product={product} tiny />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">{variant.sku}</span>
          <span className="font-extrabold text-orange-500 text-lg">{parseFloat(variant.price).toFixed(2)} €</span>
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
            disabled={isUnavailable}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CartIcon size={12} />
            {isUnavailable ? "Sin stock" : cartItem ? `Añadir más (${cartItem.qty})` : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  )
}