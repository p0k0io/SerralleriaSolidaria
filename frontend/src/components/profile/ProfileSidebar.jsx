const ITEMS = [
  {
    key: "perfil",
    label: "Mi perfil",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: "pedidos",
    label: "Mis pedidos",
    href: "/mis-pedidos",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    key: "seguridad",
    label: "Seguridad",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
  {
    key: "direcciones",
    label: "Direcciones",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
]

export default function ProfileSidebar({ active, onChange, onLogout }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(249,115,22,0.13)",
        borderRadius: 20,
        padding: "12px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {ITEMS.map((item) => {
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              background: isActive ? "rgba(249,115,22,0.09)" : "transparent",
              color: isActive ? "#ea580c" : "#64748b",
              fontWeight: isActive ? 600 : 500,
              fontSize: 13.5,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "#f8fafc"
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent"
            }}
          >
            <span
              style={{
                opacity: isActive ? 1 : 0.55,
                display: "flex",
                alignItems: "center",
              }}
            >
              {item.icon}
            </span>
            {item.label}
            {isActive && (
              <span
                style={{
                  marginLeft: "auto",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#f97316",
                }}
              />
            )}
          </button>
        )
      })}

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(249,115,22,0.10)",
          margin: "6px 4px",
        }}
      />

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          background: "transparent",
          color: "#ef4444",
          fontWeight: 500,
          fontSize: 13.5,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </button>
    </div>
  )
}