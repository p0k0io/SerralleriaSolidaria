export default function ProfileHeader({ user }) {
  function getInitials(name = "") {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
  }

  const roleLabel = {
    admin: "Administrador",
    customer: "Cliente",
  }[user?.role] ?? user?.role ?? "Usuario"

  const roleColor =
    user?.role === "admin"
      ? { bg: "rgba(239,68,68,0.1)", color: "#dc2626", border: "rgba(239,68,68,0.2)" }
      : { bg: "rgba(249,115,22,0.10)", color: "#ea580c", border: "rgba(249,115,22,0.25)" }

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(249,115,22,0.13)",
        borderRadius: 20,
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        flexWrap: "wrap",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 26,
          fontWeight: 800,
          flexShrink: 0,
          boxShadow: "0 4px 16px rgba(249,115,22,0.30)",
          letterSpacing: "-0.02em",
        }}
      >
        {getInitials(user?.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {user?.name || "—"}
          </h1>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              background: roleColor.bg,
              color: roleColor.color,
              border: `1px solid ${roleColor.border}`,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {roleLabel}
          </span>
        </div>

        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          @{user?.username || "—"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
          {user?.email || "—"}
        </p>
      </div>

      {/* Decoration strip */}
      <div
        style={{
          width: 4,
          height: 56,
          borderRadius: 4,
          background: "linear-gradient(180deg, #f97316 0%, #fdba74 100%)",
          flexShrink: 0,
          alignSelf: "center",
          display: "block",
        }}
      />
    </div>
  )
}