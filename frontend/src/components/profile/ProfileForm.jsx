import { useState, useEffect } from "react"
import { updateProfile } from "./profileApi"

function Field({ label, name, value, onChange, type = "text", placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 42,
          padding: "0 14px",
          fontSize: 14,
          fontWeight: 500,
          color: "#0f172a",
          background: focused ? "white" : "#f8fafc",
          border: `1.5px solid ${focused ? "#f97316" : "#e2e8f0"}`,
          borderRadius: 12,
          outline: "none",
          transition: "all 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(249,115,22,0.10)" : "none",
        }}
      />
    </div>
  )
}

export default function ProfileForm({ user, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | "ok" | "error"
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        address: user.address || "",
      })
    }
  }, [user])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setStatus(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await updateProfile(form)
      setStatus("ok")
      if (onSuccess) onSuccess(form)
    } catch (err) {
      setStatus("error")
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
          Información personal
        </h2>
        <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "4px 0 0" }}>
          Actualiza tus datos de perfil
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <Field label="Nombre completo" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
          <Field label="Username" name="username" value={form.username} onChange={handleChange} placeholder="@usuario" />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
          <Field label="Dirección" name="address" value={form.address} onChange={handleChange} placeholder="Calle, número, ciudad" />
        </div>

        {/* Feedback */}
        {status === "ok" && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(34,197,94,0.09)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#16a34a",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Perfil actualizado correctamente
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.22)",
              color: "#dc2626",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 42,
              padding: "0 28px",
              background: loading
                ? "#fed7aa"
                : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: "white",
              fontWeight: 700,
              fontSize: 13.5,
              border: "none",
              borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 2px 8px rgba(249,115,22,0.28)",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}