import { Outlet, Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

const CART_KEY  = "tienda_cart"
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
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount,    setCartCount]    = useState(getCartCount)
  const [user,         setUser]         = useState(null)
  const [loadingUser,  setLoadingUser]  = useState(true)
  const userMenuRef = useRef(null)
  const navigate    = useNavigate()

  useEffect(() => {
    const handler = () => setCartCount(getCartCount())
    window.addEventListener("cart-updated", handler)
    window.addEventListener("storage",      handler)
    return () => {
      window.removeEventListener("cart-updated", handler)
      window.removeEventListener("storage",      handler)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoadingUser(false); return }

    fetch("http://localhost:8000/api/user", {
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error("Unauthenticated"); return res.json() })
      .then((data) => setUser(data))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setUser(null) })
      .finally(() => setLoadingUser(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cerrar menú mobile con Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        setMenuOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  function handleLogout() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      fetch("/api/logout", {
        method: "POST",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("user")
    setUser(null)
    setUserMenuOpen(false)
    navigate("/")
  }

  function getInitials(name = "") {
    return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
  }

  const navLinks = [
    { label: "Inicio",      to: "/" },
    { label: "Productos",   to: "/productos" },
    { label: "Categorías",  to: "/categorias" },
    { label: "Seguimiento", to: "/seguimiento" },
    { label: "Información", to: "/informacion" },
    { label: "FAQ",         to: "/faq" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAV ───────────────────────────────────────────────── */}
      {/*
        FIX: <header> semántico envuelve la navegación principal.
        FIX: <nav> con aria-label="Navegación principal" para diferenciarlo
             de otras navs en la página (breadcrumbs, paginación…).
      */}
      <header>
        <nav aria-label="Navegación principal" className="sticky top-0 z-50 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">

            {/* ISLA 1 — Logo */}
            <div className="bg-white border border-orange-100 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-2 shrink-0">
              {/*
                FIX: Link con aria-label descriptivo en lugar de imagen vacía.
                FIX: img con alt descriptivo. Si es decorativa y el link ya tiene
                     texto, alt="" — pero aquí es el único contenido del link.
              */}
              <Link to="/" aria-label="Ir a la página de inicio">
                <img
                  src="./logoweb.png"
                  alt="Logo de la tienda"
                  className="w-32 h-7 object-contain"
                />
              </Link>
            </div>

            {/* ISLA 2 — Links desktop */}
            <div
              className="hidden md:flex bg-white border border-orange-100 shadow-sm rounded-2xl px-5 py-2 items-center gap-1"
              role="list"
            >
              {navLinks.map(({ label, to }) => (
                <div role="listitem" key={label}>
                  <Link
                    to={to}
                    className="flex items-center gap-1.5 text-slate-500 text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
                  >
                    {label}
                  </Link>
                </div>
              ))}
            </div>

            {/* ISLA 3 — Carrito + Auth */}
            <div className="bg-white border border-orange-100 shadow-sm rounded-2xl px-3 py-2 flex items-center gap-2 shrink-0">

              {/*
                FIX: Link del carrito con aria-label que describe la acción
                     Y la cantidad. Los lectores de pantalla no leen el badge visual.
              */}
              <Link
                to="/carrito"
                aria-label={
                  cartCount > 0
                    ? `Ver carrito, ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`
                    : "Ver carrito, vacío"
                }
                className="relative w-9 h-9 rounded-xl border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-150 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
              >
                {/* FIX: SVG decorativo — aria-hidden, el label del Link lo describe */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16" height="16"
                  viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
                </svg>

                {/* FIX: Badge visual — aria-hidden porque la info ya está en el aria-label del Link */}
                {cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 group-hover:bg-white group-hover:text-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-150"
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* ── AUTH ZONE ── */}
              {loadingUser ? (
                /*
                  FIX: Skeleton con role="status" y aria-label para que el lector
                       informe de que está cargando.
                */
                <div
                  role="status"
                  aria-label="Cargando información de usuario"
                  className="hidden sm:flex w-24 h-9 bg-orange-50 rounded-xl animate-pulse"
                />
              ) : user ? (
                /* Usuario autenticado */
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  {/*
                    FIX: aria-expanded indica si el menú está abierto.
                    FIX: aria-controls apunta al id del menú desplegable.
                    FIX: aria-haspopup="menu" indica que abre un menú.
                  */}
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    aria-controls="user-dropdown"
                    aria-haspopup="menu"
                    aria-label={`Menú de usuario, ${user.name.split(" ")[0]}`}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-orange-50 transition-all duration-150 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
                  >
                    {/* Avatar con iniciales — aria-hidden porque el aria-label del botón ya describe el usuario */}
                    <div
                      aria-hidden="true"
                      className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
                    >
                      {getInitials(user.name)}
                    </div>
                    <span className="text-slate-700 text-sm font-semibold max-w-[110px] truncate group-hover:text-orange-600 transition-colors">
                      {user.name.split(" ")[0]}
                    </span>
                    {/* FIX: Chevron decorativo */}
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      xmlns="http://www.w3.org/2000/svg"
                      width="12" height="12"
                      viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    /*
                      FIX: role="menu" + id para aria-controls.
                      FIX: Los items de menú tienen role="menuitem".
                    */
                    <div
                      id="user-dropdown"
                      role="menu"
                      aria-label="Opciones de usuario"
                      className="absolute right-0 mt-2 w-56 bg-white border border-orange-100 shadow-lg rounded-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 bg-orange-50 border-b border-orange-100" aria-hidden="true">
                        <p className="text-xs text-orange-400 font-medium uppercase tracking-wide">Sesión activa</p>
                        <p className="text-slate-800 font-semibold text-sm mt-0.5 truncate">{user.name}</p>
                        {user.email && <p className="text-slate-400 text-xs truncate">{user.email}</p>}
                      </div>

                      <Link
                        to="/perfil"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                      >
                        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        Mi perfil
                      </Link>

                      <Link
                        to="/mis-pedidos"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                      >
                        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        Mis pedidos
                      </Link>

                      <div className="border-t border-orange-50">
                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                        >
                          <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/register"
                  className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
                >
                  <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Registro
                </Link>
              )}

              {/*
                FIX: Botón hamburger con aria-expanded + aria-controls + aria-label.
              */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-orange-50 hover:text-orange-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
              >
                {menuOpen
                  ? <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            /*
              FIX: id para aria-controls del botón hamburger.
              FIX: nav con aria-label específico para el menú mobile.
            */
            <nav
              id="mobile-menu"
              aria-label="Menú de navegación móvil"
              className="md:hidden mt-2 mx-auto max-w-6xl bg-white border border-orange-100 shadow-md rounded-2xl overflow-hidden"
            >
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-5 py-3 text-slate-600 text-sm font-medium hover:bg-orange-50 hover:text-orange-600 border-b border-orange-50 last:border-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                >
                  {label}
                </Link>
              ))}

              <div className="p-3 border-t border-orange-50">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 bg-orange-50 rounded-xl mb-2" aria-hidden="true">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-800 font-semibold text-sm truncate">{user.name}</p>
                        {user.email && <p className="text-slate-400 text-xs truncate">{user.email}</p>}
                      </div>
                    </div>
                    <Link to="/perfil" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-slate-600 text-sm hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                      Mi perfil
                    </Link>
                    <Link to="/mis-pedidos" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-slate-600 text-sm hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                      Mis pedidos
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false) }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2">
                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Registrarse
                  </Link>
                )}
              </div>
            </nav>
          )}
        </nav>
      </header>

      {/* FIX: <main> con id para skip-link (ver abajo) */}
      <main id="main-content" tabIndex={-1}>
        <div className="px-4 py-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}