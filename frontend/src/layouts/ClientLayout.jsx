import { Outlet, Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

const CART_KEY = "tienda_cart"
const TOKEN_KEY = "token" 
function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]")
    return cart.reduce((a, c) => a + c.qty, 0)
  } catch {
    return 0
  }
}

export default function ClientLayout() {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount, setCartCount]   = useState(getCartCount)
  const [user, setUser]             = useState(null) 
  const [loadingUser, setLoadingUser] = useState(true)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()

 
  useEffect(() => {
    const handler = () => setCartCount(getCartCount())
    window.addEventListener("cart-updated", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("cart-updated", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])


  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoadingUser(false)
      return
    }

    fetch("http://localhost:8000/api/user", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated")
        return res.json()
      })
      .then((data) => setUser(data))
      .catch(() => {
        // Token inválido o expirado → limpiamos
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => setLoadingUser(false))
  }, [])

  /* ── Cerrar user-menu al hacer clic fuera ── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* ── Cerrar sesión ── */
  function handleLogout() {
    const token = localStorage.getItem(TOKEN_KEY)
    // Llama al endpoint de logout si tu API lo tiene (opcional)
    if (token) {
      fetch("/api/logout", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setUserMenuOpen(false)
    navigate("/")
  }

  /* ── Iniciales para el avatar ── */
  function getInitials(name = "") {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
  }

  const navLinks = [
    {
      label: "Inicio",
      to: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: "Productos",
      to: "/productos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      ),
    },
    {
      label: "Categorías",
      to: "/categorias",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
        </svg>
      ),
    },
    {
      label: "Seguimiento",
      to: "/seguimiento",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: "Información",
      to: "/informacion",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      label: "FAQ",
      to: "/faq",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">

          {/* ISLA 1 — Logo */}
          <div className="bg-white border border-orange-100 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
              </svg>
            </div>
            <span className="text-orange-600 font-bold text-base tracking-tight">Tienda</span>
          </div>

          {/* ISLA 2 — Links (desktop) */}
          <div className="hidden md:flex bg-white border border-orange-100 shadow-sm rounded-2xl px-5 py-2 items-center gap-1">
            {navLinks.map(({ label, to, icon }) => (
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

          {/* ISLA 3 — Carrito + Auth */}
          <div className="bg-white border border-orange-100 shadow-sm rounded-2xl px-3 py-2 flex items-center gap-2 shrink-0">

            {/* Carrito */}
            <Link
              to="/carrito"
              className="relative w-9 h-9 rounded-xl border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-150 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 group-hover:bg-white group-hover:text-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-150">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ── AUTH ZONE ── */}
            {loadingUser ? (
              /* Skeleton mientras carga */
              <div className="hidden sm:flex w-24 h-9 bg-orange-50 rounded-xl animate-pulse" />
            ) : user ? (
              /* Usuario autenticado → chip con nombre + dropdown */
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-orange-50 transition-all duration-150 group"
                >
                  {/* Avatar con iniciales */}
                  <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(user.name)}
                  </div>
                  {/* Nombre (truncado si es largo) */}
                  <span className="text-slate-700 text-sm font-semibold max-w-[110px] truncate group-hover:text-orange-600 transition-colors">
                    {user.name.split(" ")[0]}
                  </span>
                  {/* Chevron */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-orange-100 shadow-lg rounded-2xl overflow-hidden z-50">
                    {/* Cabecera con info completa */}
                    <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                      <p className="text-xs text-orange-400 font-medium uppercase tracking-wide">Sesión activa</p>
                      <p className="text-slate-800 font-semibold text-sm mt-0.5 truncate">{user.name}</p>
                      {user.email && (
                        <p className="text-slate-400 text-xs truncate">{user.email}</p>
                      )}
                    </div>

                    {/* Opciones */}
                    <Link
                      to="/perfil"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Mi perfil
                    </Link>
                    <Link
                      to="/mis-pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      Mis pedidos
                    </Link>

                    {/* Cerrar sesión */}
                    <div className="border-t border-orange-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No autenticado → botón Registro */
              <Link
                to="/register"
                className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Registro
              </Link>
            )}

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
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-5 py-3 text-slate-600 text-sm font-medium hover:bg-orange-50 hover:text-orange-600 border-b border-orange-50 last:border-0 transition-colors"
              >
                {label}
              </Link>
            ))}

            {/* Sección auth mobile */}
            <div className="p-3 border-t border-orange-50">
              {user ? (
                <div className="space-y-1">
                  {/* Info usuario */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-orange-50 rounded-xl mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-800 font-semibold text-sm truncate">{user.name}</p>
                      {user.email && <p className="text-slate-400 text-xs truncate">{user.email}</p>}
                    </div>
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-600 text-sm hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                  >
                    Mi perfil
                  </Link>
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-600 text-sm hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                  >
                    Mis pedidos
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false) }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Registrarse
                </Link>
              )}
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