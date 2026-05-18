import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchProfile } from "../components/profile/profileApi"
import ProfileHeader from "../components/profile/ProfileHeader"
import ProfileSidebar from "../components/profile/ProfileSidebar"
import ProfileForm from "../components/profile/ProfileForm"
import PasswordForm from "../components/profile/PasswordForm"

const TOKEN_KEY = "token"

// ─── AddressCard (vista direcciones) ──────────────────────────
function AddressCard({ user }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(249,115,22,0.13)",
        borderRadius: 20,
        padding: "28px 32px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
        Dirección de envío
      </h2>
      <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "0 0 20px" }}>
        Dirección asociada a tu cuenta
      </p>
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 14,
          background: "rgba(249,115,22,0.05)",
          border: "1px dashed rgba(249,115,22,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "rgba(249,115,22,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
            {user?.address || "Sin dirección registrada"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Dirección principal
          </p>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 14 }}>
        Para cambiar tu dirección, edítala desde la pestaña{" "}
        <span style={{ color: "#f97316", fontWeight: 600 }}>Mi perfil</span>.
      </p>
    </div>
  )
}

// ─── LoadingScreen ─────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "3px solid rgba(249,115,22,0.15)",
          borderTopColor: "#f97316",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <p style={{ fontSize: 13.5, color: "#94a3b8", fontWeight: 500 }}>Cargando perfil…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────
export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("perfil")
  const [mobileDrawer, setMobileDrawer] = useState(false)
  const navigate = useNavigate()

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      navigate("/login")
      return
    }
    fetchProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        navigate("/login")
      })
      .finally(() => setLoading(false))
  }, [navigate])

  // Lock scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileDrawer ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileDrawer])

  function handleLogout() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      fetch("http://localhost:8000/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    navigate("/")
  }

  function handleProfileSuccess(updatedData) {
    setUser((prev) => ({ ...prev, ...updatedData }))
  }

  function handleSectionChange(key) {
    setActiveSection(key)
    setMobileDrawer(false)
  }

  if (loading) return <LoadingScreen />

  const sectionLabel = {
    perfil: "Mi perfil",
    seguridad: "Seguridad",
    direcciones: "Direcciones",
    pedidos: "Mis pedidos",
  }[activeSection]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 60px" }}>

      {/* ── Mobile top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        className="profile-mobile-bar"
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {sectionLabel}
          </h2>
        </div>
        <button
          onClick={() => setMobileDrawer(true)}
          className="profile-menu-btn"
          style={{
            display: "none",
            alignItems: "center",
            gap: 6,
            height: 36,
            padding: "0 14px",
            background: "white",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            color: "#ea580c",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          Menú
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileDrawer && (
        <>
          <div
            onClick={() => setMobileDrawer(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.18)",
              backdropFilter: "blur(2px)",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: 280,
              background: "white",
              zIndex: 50,
              boxShadow: "4px 0 32px rgba(0,0,0,0.10)",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Mi cuenta</span>
              <button
                onClick={() => setMobileDrawer(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <ProfileSidebar
              active={activeSection}
              onChange={handleSectionChange}
              onLogout={handleLogout}
            />
          </div>
        </>
      )}

      {/* ── Desktop layout ── */}
      <div
        style={{
          display: "grid",
          gap: 20,
        }}
        className="profile-grid"
      >
        {/* Header — full width */}
        <div className="profile-header-area">
          <ProfileHeader user={user} />
        </div>

        {/* Sidebar — left column */}
        <div className="profile-sidebar-area">
          <ProfileSidebar
            active={activeSection}
            onChange={handleSectionChange}
            onLogout={handleLogout}
          />
        </div>

        {/* Content — right column */}
        <div className="profile-content-area" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeSection === "perfil" && (
            <ProfileForm user={user} onSuccess={handleProfileSuccess} />
          )}
          {activeSection === "seguridad" && <PasswordForm />}
          {activeSection === "direcciones" && <AddressCard user={user} />}
          {activeSection === "pedidos" && (
            <div
              style={{
                background: "white",
                border: "1px solid rgba(249,115,22,0.13)",
                borderRadius: 20,
                padding: "28px 32px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "rgba(249,115,22,0.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                Ver mis pedidos
              </h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>
                Consulta el estado de todos tus pedidos
              </p>
              <a
                href="/mis-pedidos"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 24px",
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  borderRadius: 12,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(249,115,22,0.28)",
                }}
              >
                Ir a mis pedidos
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-grid {
          grid-template-columns: 1fr;
          grid-template-areas:
            "header"
            "sidebar"
            "content";
        }
        .profile-header-area  { grid-area: header; }
        .profile-sidebar-area { grid-area: sidebar; }
        .profile-content-area { grid-area: content; }

        @media (min-width: 768px) {
          .profile-grid {
            grid-template-columns: 220px 1fr;
            grid-template-areas:
              "header  header"
              "sidebar content";
          }
          .profile-menu-btn { display: none !important; }
          .profile-mobile-bar { display: none !important; }
        }

        @media (max-width: 767px) {
          .profile-menu-btn { display: flex !important; }
          .profile-sidebar-area { display: none !important; }
          .profile-mobile-bar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}