import { useState, useEffect } from "react"

const CART_KEY = "tienda_cart"



function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") }
  catch { return [] }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}


function ProductIcon({ name = "", size = 28 }) {
  const n = name.toLowerCase()
  const p = {
    xmlns: "http://www.w3.org/2000/svg", width: size, height: size,
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round",
  }
  if (n.includes("bomb"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  if (n.includes("escudo"))
    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  if (n.includes("cerradura"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>
  return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
}



function CartRow({ item, onQty, onRemove }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow duration-200">

      {/* Thumb */}
      <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300">
        <ProductIcon name={item.product_name} size={28} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm truncate">{item.product_name}</p>
        <p className="font-mono text-[11px] text-slate-400 mt-0.5">{item.sku}</p>
        <p className="font-extrabold text-orange-500 text-base mt-1">
          ${parseFloat(item.price).toFixed(2)}
        </p>
      </div>

    
      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
        <button
          onClick={() => onQty(item.id, item.qty - 1)}
          className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg"
        >−</button>
        <span className="w-7 text-center text-sm font-bold text-slate-700 select-none">{item.qty}</span>
        <button
          onClick={() => onQty(item.id, item.qty + 1)}
          className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg"
        >+</button>
      </div>

      <div className="text-right shrink-0 hidden sm:block w-20">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Subtotal</p>
        <p className="font-extrabold text-slate-800 text-base">
          ${(parseFloat(item.price) * item.qty).toFixed(2)}
        </p>
      </div>

     
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
        aria-label="Eliminar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    </div>
  )
}


function CartSummary({ cart, onCheckout, loading }) {
  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0)
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 h-fit sticky top-6">

      <h2 className="font-extrabold text-slate-800 text-lg">Resumen</h2>

      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Productos ({totalQty})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Envío</span>
          <span className="text-green-500 font-semibold">Gratis</span>
        </div>
        <div className="border-t border-slate-100 my-1" />
        <div className="flex justify-between font-extrabold text-slate-800 text-base">
          <span>Total</span>
          <span className="text-orange-500">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Redirigiendo…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Ir a pagar
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-400">Pago seguro · SSL cifrado</p>
    </div>
  )
}


function CartEmpty() {
  return (
    <div className="text-center py-24 flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
        </svg>
      </div>
      <p className="font-extrabold text-slate-700 text-lg">Tu carrito está vacío</p>
      <p className="text-slate-400 text-sm">Añade productos desde la tienda</p>
      <a
        href="/"
        className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95"
      >
        Ver productos
      </a>
    </div>
  )
}


export default function CartPage() {
  const [cart, setCart]       = useState(loadCart)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError]     = useState("")


  useEffect(() => {
    const sync = () => setCart(loadCart())
    window.addEventListener("cart-updated", sync)
    return () => window.removeEventListener("cart-updated", sync)
  }, [])

  function updateQty(id, qty) {
    if (qty < 1) return removeItem(id)
    setCart((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, qty } : i)
      persistCart(next)
      return next
    })
  }

  function removeItem(id) {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id)
      persistCart(next)
      return next
    })
  }

  function clearCart() {
    setCart([])
    persistCart([])
  }

  
  async function handleStripeCheckout() {
    setStripeLoading(true)
    setStripeError("")
    try {
      const res = await fetch("http://localhost:8000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      })
      const data = await res.json()
      window.location.href = data.url  
    } catch (err) {
      console.error("Error Stripe:", err)
      setStripeError("No se pudo conectar con el servidor de pagos.")
    } finally {
      setStripeLoading(false)
    }
  }

  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div>

      {/* Cabecera */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tu carrito</h1>
          <p className="text-slate-400 text-sm mt-0.5">{totalQty} artículo{totalQty !== 1 ? "s" : ""}</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Vaciar carrito
          </button>
        )}
      </div>

      {/* Error Stripe */}
      {stripeError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 text-sm font-medium px-4 py-3 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {stripeError}
        </div>
      )}

      {/* Contenido */}
      {cart.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Lista */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {cart.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                onQty={updateQty}
                onRemove={removeItem}
              />
            ))}
          </div>

  
          <CartSummary
            cart={cart}
            onCheckout={handleStripeCheckout}
            loading={stripeLoading}
          />

        </div>
      )}
    </div>
  )
}