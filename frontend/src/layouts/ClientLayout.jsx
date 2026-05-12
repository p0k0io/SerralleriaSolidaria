import { Outlet, Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

const CART_KEY  = "tienda_cart"
const TOKEN_KEY = "token"

function getCartCount() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]").reduce((a, c) => a + c.qty, 0)
  } catch { return 0 }
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
    const sync = () => setCartCount(getCartCount())
    window.addEventListener("cart-updated", sync)
    window.addEventListener("storage", sync)
    return () => { window.removeEventListener("cart-updated", sync); window.removeEventListener("storage", sync) }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoadingUser(false); return }
    fetch("http://localhost:8000/api/user", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setUser(d))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setUser(null) })
      .finally(() => setLoadingUser(false))
  }, [])

  useEffect(() => {
    const h = e => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  function handleLogout() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) fetch("/api/logout", { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    setUser(null); setUserMenuOpen(false); navigate("/")
  }

  const initials = (name = "") => name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")

  const NAV_LINKS = [
    { label: "Inicio",      to: "/" },
    { label: "Productos",   to: "/productos" },
    { label: "Categorías",  to: "/categorias" },
    { label: "Seguimiento", to: "/seguimiento" },
    { label: "Información", to: "/informacion" },
    { label: "FAQ",         to: "/faq" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f3" }}>

      {/*
        ══════════════════════════════════════════════
        NAVBAR — fixed, full viewport width, 64px tall
        Slightly warmer white than the page surface.
        ══════════════════════════════════════════════
      */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: 64,
          background: "rgba(255,255,254,0.94)",
          backdropFilter: "blur(16px) saturate(1.2)",
          WebkitBackdropFilter: "blur(16px) saturate(1.2)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
        }}
      >
        <div style={{
          height: "100%", maxWidth: 1600, margin: "0 auto",
          padding: "0 28px",
          display: "flex", alignItems: "center", gap: 8,
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginRight: 8, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30,
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              borderRadius: 9,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(249,115,22,0.30)",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Tienda</span>
          </Link>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "#e2e8f0", flexShrink: 0, display: "none" }} className="hidden-md-show" />

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }} className="desktop-nav">
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "block",
                  fontSize: 13, fontWeight: 500, color: "#64748b",
                  padding: "6px 11px",
                  borderRadius: 8,
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b" }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }}>

            {/* Presupuesto pill */}
            <Link to="/solicitud" style={{ textDecoration: "none" }} className="presupuesto-link">
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12.5, fontWeight: 600, color: "#c2410c",
                background: "rgba(255,237,213,0.7)",
                border: "1px solid rgba(253,186,116,0.5)",
                padding: "6px 13px",
                borderRadius: 9,
                transition: "all 0.12s ease",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fed7aa"; e.currentTarget.style.borderColor = "#fb923c" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,237,213,0.7)"; e.currentTarget.style.borderColor = "rgba(253,186,116,0.5)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Presupuesto
              </span>
            </Link>

            {/* Cart */}
            <Link to="/carrito" style={{ textDecoration: "none" }}>
              <span
                style={{
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: 9, color: "#64748b",
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
                </svg>
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -1, right: -1,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#f97316", color: "white",
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {cartCount}
                  </span>
                )}
              </span>
            </Link>

            {/* Auth */}
            {loadingUser ? (
              <div style={{ width: 72, height: 32, background: "#f1f5f9", borderRadius: 8 }} />
            ) : user ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "4px 10px 4px 4px",
                    background: "transparent", border: "none", cursor: "pointer",
                    borderRadius: 9, transition: "all 0.12s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0,
                  }}>
                    {initials(user.name)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name.split(" ")[0]}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: "transform 0.2s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 208, background: "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 14, overflow: "hidden", zIndex: 100,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                          {initials(user.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                          {user.email && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 6 }}>
                      {[{ label: "Mi perfil", to: "/perfil" }, { label: "Mis pedidos", to: "/mis-pedidos" }].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                          <span style={{ display: "block", padding: "8px 12px", fontSize: 13, color: "#475569", borderRadius: 9, transition: "all 0.1s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a" }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569" }}>
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div style={{ padding: "4px 6px 6px", borderTop: "1px solid #f1f5f9" }}>
                      <button onClick={handleLogout} style={{
                        width: "100%", padding: "8px 12px", background: "none", border: "none",
                        fontSize: 13, color: "#ef4444", textAlign: "left", cursor: "pointer",
                        borderRadius: 9, transition: "all 0.1s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/register" style={{ textDecoration: "none" }}>
                <span style={{
                  display: "flex", alignItems: "center",
                  fontSize: 13, fontWeight: 600, color: "white",
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  padding: "7px 16px", borderRadius: 9,
                  boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
                  transition: "all 0.12s ease", letterSpacing: "-0.01em",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(234,88,12,0.35)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(249,115,22,0.25)" }}
                >
                  Registro
                </span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="mobile-menu-btn"
              style={{
                display: "none", width: 36, height: 36, borderRadius: 9,
                background: "none", border: "none", cursor: "pointer",
                alignItems: "center", justifyContent: "center", color: "#64748b",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "rgba(255,255,254,0.97)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}>
            <div style={{ maxWidth: 1600, margin: "0 auto", padding: "12px 20px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {NAV_LINKS.map(({ label, to }) => (
                  <Link key={label} to={to} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <span style={{ display: "block", padding: "10px 12px", fontSize: 13, fontWeight: 500, color: "#475569", borderRadius: 9, transition: "all 0.1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569" }}>
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/*
        Global responsive styles injected here.
        Keeps Tailwind out of the structural layout layer.
      */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav     { display: none !important; }
          .presupuesto-link { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Page content — pushed below the fixed 64px navbar */}
      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>
    </div>
  )
}