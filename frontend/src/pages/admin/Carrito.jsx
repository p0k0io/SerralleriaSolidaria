import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../../context/AuthContext"

const CART_KEY = "tienda_cart"

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

function ProductIcon({ name = "", size = 28 }) {
  const n = name.toLowerCase()
  const p = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }

  if (n.includes("bomb")) {
    return (
      <svg {...p}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    )
  }
  if (n.includes("escudo")) {
    return (
      <svg {...p}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  if (n.includes("cerradura")) {
    return (
      <svg {...p}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  )
}

function CartRow({ item, onQty, onRemove }) {
  const price = Number(item.price) || 0
  const qty = Number(item.qty) || 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300">
        <ProductIcon name={item.product_name} size={28} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm truncate">{item.product_name}</p>
        <p className="font-mono text-[11px] text-slate-400 mt-0.5">{item.sku}</p>
        <p className="font-extrabold text-orange-500 text-base mt-1">€{price.toFixed(2)}</p>
      </div>

      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => onQty(item.id, qty - 1)}
          className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-bold text-slate-700 select-none">{qty}</span>
        <button
          type="button"
          onClick={() => onQty(item.id, qty + 1)}
          className="w-8 h-9 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors text-lg"
        >
          +
        </button>
      </div>

      <div className="text-right shrink-0 hidden sm:block w-20">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Subtotal</p>
        <p className="font-extrabold text-slate-800 text-base">€{(price * qty).toFixed(2)}</p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
        aria-label="Eliminar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </button>
    </div>
  )
}

function InputField({ label, name, value, onChange, placeholder, type = "text", required = true, autoComplete }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  )
}

function CartSummary({ cart, onCheckout, loading, disabled, totalAmount }) {
  const subtotal = totalAmount
  const totalQty = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 h-fit sticky top-6">
      <h2 className="font-extrabold text-slate-800 text-lg">Resumen</h2>

      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Productos ({totalQty})</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Envío</span>
          <span className="text-green-500 font-semibold">Gratis</span>
        </div>
        <div className="border-t border-slate-100 my-1" />
        <div className="flex justify-between font-extrabold text-slate-800 text-base">
          <span>Total</span>
          <span className="text-orange-500">€{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Redirigiendo…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Ir a pagar
          </>
        )}
      </button>

      {disabled && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Completa todos los datos de envío para continuar.
        </p>
      )}

      <p className="text-center text-[10px] text-slate-400">Pago seguro · SSL cifrado</p>
    </div>
  )
}

function CartEmpty() {
  return (
    <div className="text-center py-24 flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12" />
        </svg>
      </div>
      <p className="font-extrabold text-slate-700 text-lg">Tu carrito está vacío</p>
      <p className="text-slate-400 text-sm">Añade productos desde la tienda</p>
      <a href="/" className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95">
        Ver productos
      </a>
    </div>
  )
}

const INITIAL_ADDRESS = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  postal_code: "",
  city: "",
  country: "España",
}

export default function CartPage() {
  const [cart, setCart] = useState(loadCart)
  const [address, setAddress] = useState(INITIAL_ADDRESS)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState("")

  // ✅ Añadido authFetch al destructuring
  const { user, authFetch } = useAuth()

  useEffect(() => {
    const sync = () => setCart(loadCart())
    window.addEventListener("cart-updated", sync)
    return () => window.removeEventListener("cart-updated", sync)
  }, [])

  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      full_name: prev.full_name || user?.name || "",
      email: prev.email || user?.email || "",
    }))
  }, [user])

  function updateQty(id, qty) {
    if (qty < 1) return removeItem(id)
    setCart((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, qty } : i))
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

  const totalAmount = useMemo(
    () => cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0),
    [cart]
  )

  const isAddressComplete =
    address.full_name.trim() &&
    address.email.trim() &&
    address.phone.trim() &&
    address.address.trim() &&
    address.postal_code.trim() &&
    address.city.trim() &&
    address.country.trim()

  async function handleStripeCheckout() {
    if (!user) {
      setStripeError("Debes iniciar sesión para continuar.")
      return
    }

    if (!cart.length) {
      setStripeError("Tu carrito está vacío.")
      return
    }

    if (!isAddressComplete) {
      setStripeError("Completa los datos de dirección antes de pagar.")
      return
    }

    setStripeLoading(true)
    setStripeError("")

    console.log("📤 Enviando:", {
  items: cart,
  ...address
})

    try {
    const token = localStorage.getItem("token")

const res = await fetch("http://localhost:8000/api/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    items: cart,
    ...address
  })
})
      

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "No se pudo crear el checkout")
      }

      if (!data?.url) {
        throw new Error("La respuesta del servidor no incluye la URL de Stripe")
      }

      window.location.href = data.url
    } catch (err) {
      console.error("Error Stripe:", err)
      setStripeError(err.message || "No se pudo conectar con el servidor de pagos.")
    } finally {
      setStripeLoading(false)
    }
  }

  const totalQty = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tu carrito</h1>
          <p className="text-slate-400 text-sm mt-0.5">{totalQty} artículo{totalQty !== 1 ? "s" : ""}</p>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            Vaciar carrito
          </button>
        )}
      </div>

      {stripeError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 text-sm font-medium px-4 py-3 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {stripeError}
        </div>
      )}

      {cart.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-extrabold text-slate-800 text-lg mb-4">Datos de envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Nombre completo"
                  name="full_name"
                  value={address.full_name}
                  onChange={(e) => setAddress((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Tu nombre y apellidos"
                  autoComplete="name"
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={address.email}
                  onChange={(e) => setAddress((p) => ({ ...p, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
                <InputField
                  label="Teléfono"
                  name="phone"
                  value={address.phone}
                  onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="600 000 000"
                  autoComplete="tel"
                />
                <InputField
                  label="Código postal"
                  name="postal_code"
                  value={address.postal_code}
                  onChange={(e) => setAddress((p) => ({ ...p, postal_code: e.target.value }))}
                  placeholder="28001"
                  autoComplete="postal-code"
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Dirección"
                    name="address"
                    value={address.address}
                    onChange={(e) => setAddress((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Calle, número, piso, puerta"
                    autoComplete="street-address"
                  />
                </div>
                <InputField
                  label="Ciudad"
                  name="city"
                  value={address.city}
                  onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                  placeholder="Madrid"
                  autoComplete="address-level2"
                />
                <InputField
                  label="País"
                  name="country"
                  value={address.country}
                  onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                  placeholder="España"
                  autoComplete="country-name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <CartRow key={item.id} item={item} onQty={updateQty} onRemove={removeItem} />
              ))}
            </div>
          </div>

          <CartSummary
            cart={cart}
            totalAmount={totalAmount}
            onCheckout={handleStripeCheckout}
            loading={stripeLoading}
            disabled={!isAddressComplete}
          />
        </div>
      )}
    </div>
  )
}
