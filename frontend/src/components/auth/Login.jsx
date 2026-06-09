import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const CART_KEY = "tienda_cart"

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function Login() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {

      /*
      |--------------------------------------------------------------------------
      | Login
      |--------------------------------------------------------------------------
      */

      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas")
        return
      }

      /*
      |--------------------------------------------------------------------------
      | Guardar auth
      |--------------------------------------------------------------------------
      */

      login(data.token, data.user)
      const token = data.token

      /*
      |--------------------------------------------------------------------------
      | Obtener carrito localStorage
      |--------------------------------------------------------------------------
      */

      const localCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]")

      /*
      |--------------------------------------------------------------------------
      | Obtener carrito BBDD (estado real del usuario)
      |--------------------------------------------------------------------------
      */

      const cartRes = await fetch("http://localhost:8000/api/cart", {
        headers: authHeaders(token),
      })
      const backendRaw = cartRes.ok ? await cartRes.json() : []
      const backendCart = backendRaw.map((item) => ({
        cart_id: item.id,        // ← id de la tabla cart
        id: item.variant_id,
        sku: item.sku,
        product_name: item.product_name,
        price: item.price,
        qty: item.qty,
        installation_requested: item.installation_requested ?? false,
      }))

      /*
      |--------------------------------------------------------------------------
      | Fusionar: subir a BBDD los items locales que no existan ya
      |--------------------------------------------------------------------------
      */

      const uploadPromises = localCart.map((localItem) => {
        const backendItem = backendCart.find((b) => b.id === localItem.id)

        if (!backendItem) {
          return fetch("http://localhost:8000/api/cart", {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({
              variant_id: localItem.id,
              sku: localItem.sku,
              product_name: localItem.product_name,
              price: localItem.price,
              qty: localItem.qty,
              installation_requested: localItem.installation_requested ?? false,
            }),
          })
        }

        if (backendItem.installation_requested !== localItem.installation_requested) {
          return fetch(`http://localhost:8000/api/cart/${backendItem.cart_id}`, {
            method: "PUT",
            headers: authHeaders(token),
            body: JSON.stringify({
              qty: backendItem.qty,
              installation_requested: localItem.installation_requested,
            }),
          })
        }

        return Promise.resolve()
      })

      await Promise.allSettled(uploadPromises)

      /*
      |--------------------------------------------------------------------------
      | Descargar carrito FINAL desde BBDD (fuente de verdad)
      |--------------------------------------------------------------------------
      */

      const finalRes = await fetch("http://localhost:8000/api/cart", {
        headers: authHeaders(token),
      })
      const finalRaw = finalRes.ok ? await finalRes.json() : []
      const finalCart = finalRaw.map((item) => ({
        cart_id: item.id,        // ← id de la tabla cart
        id: item.variant_id,
        sku: item.sku,
        product_name: item.product_name,
        price: item.price,
        qty: item.qty,
        installation_requested: item.installation_requested ?? false,
      }))

      /*
      |--------------------------------------------------------------------------
      | Sincronizar localStorage con el carrito definitivo
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(CART_KEY, JSON.stringify(finalCart))
      window.dispatchEvent(new Event("cart-updated"))

      /*
      |--------------------------------------------------------------------------
      | Redirect
      |--------------------------------------------------------------------------
      */

      navigate("/")

    } catch (err) {
      console.error(err)
      setError("Error del servidor. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6" />
        <div className="bg-white border border-orange-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-orange-500 px-8 py-6">
            <h2 className="text-white text-2xl font-bold tracking-tight">Iniciar sesión</h2>
            <p className="text-orange-100 text-sm mt-1">Accede a tu cuenta para continuar</p>
          </div>
          <div className="px-8 py-7 space-y-5">
            {error && (
              <div role="alert" className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-600">Correo electrónico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="ejemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-600">Contraseña</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-150"
              >
              {loading ? (
                <>
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Entrando…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Entrar
                </>
              )}
            </button>
          </form>

            <p className="text-center text-sm text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
