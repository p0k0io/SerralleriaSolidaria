import { Outlet, Link } from "react-router-dom"
import { useState, useEffect } from "react"

const CART_KEY = "tienda_cart"

function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]")
    return cart.reduce((a, c) => a + c.qty, 0)
  } catch {
    return 0
  }
}

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(getCartCount)

  // Se actualiza cada vez que Home.jsx dispara "cart-updated"
  useEffect(() => {
    const handler = () => setCartCount(getCartCount())
    window.addEventListener("cart-updated", handler)
    window.addEventListener("storage", handler) // soporte multi-tab
    return () => {
      window.removeEventListener("cart-updated", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">

          {/* ISLA 1 — Logo */}
          <div className="bg-white border border-orange-100 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              </svg>
            </div>
            <span className="text-orange-600 font-bold text-base tracking-tight">Tienda</span>
          </div>

          {/* ISLA 2 — Links (desktop) */}
          <div className="hidden md:flex bg-white border border-orange-100 shadow-sm rounded-2xl px-5 py-2 items-center gap-1">
            {[
              { label: "Inicio", to: "/", icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              { label: "Productos", to: "/productos", icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
              { label: "Seguimiento", to: "/seguimiento", icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { label: "Información", to: "/informacion", icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
              { label: "FAQ", to: "/faq", icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            ].map(({ label, to, icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-1.5 text-slate-500 text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-150"
              >
                <span className="opacity-70">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* ISLA 3 — Carrito + Register */}
          <div className="bg-white border border-orange-100 shadow-sm rounded-2xl px-3 py-2 flex items-center gap-2 shrink-0">
            {/* Carrito — badge reactivo desde localStorage */}
            <Link
              to="/carrito"
              className="relative w-9 h-9 rounded-xl border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-150 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 group-hover:bg-white group-hover:text-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-150">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Register */}
            <Link
              to="/register"
              className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Registro
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-orange-50 hover:text-orange-500 transition-all"
              aria-label="Menu"
            >
              {menuOpen
                ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-6xl bg-white border border-orange-100 shadow-md rounded-2xl overflow-hidden">
            {[
              { label: "Inicio", to: "/" },
              { label: "Productos", to: "/productos" },
              { label: "Seguimiento", to: "/seguimiento" },
              { label: "Información", to: "/informacion" },
              { label: "Preguntas Frecuentes", to: "/faq" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-5 py-3 text-slate-600 text-sm font-medium hover:bg-orange-50 hover:text-orange-600 border-b border-orange-50 last:border-0 transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="p-3">
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  )
}