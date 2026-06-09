import { useState } from "react"
import { updatePassword } from "./profileApi"

function PasswordField({ label, name, value, onChange, show, onToggle }) {
  const [focused, setFocused] = useState(false)
  const id = `password-${name}`
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
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
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 42,
            padding: "0 42px 0 14px",
            fontSize: 14,
            fontWeight: 500,
            color: "#0f172a",
            background: focused ? "white" : "#f8fafc",
            border: `1.5px solid ${focused ? "#f97316" : "#e2e8f0"}`,
            borderRadius: 12,
            outline: "none",
            transition: "all 0.15s",
            boxShadow: focused ? "0 0 0 3px rgba(249,115,22,0.10)" : "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={onToggle}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          {show ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function PasswordForm() {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setStatus(null)
  }

  function toggleShow(key) {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setStatus("error")
      setErrorMsg("Las contraseñas nuevas no coinciden")
      return
    }
    if (form.password.length < 6) {
      setStatus("error")
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await updatePassword(form)
      setStatus("ok")
      setForm({ current_password: "", password: "", password_confirmation: "" })
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
          Cambiar contraseña
        </h2>
        <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "4px 0 0" }}>
          Usa al menos 6 caracteres para mayor seguridad
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PasswordField
            label="Contraseña actual"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            show={show.current}
            onToggle={() => toggleShow("current")}
          />
          <PasswordField
            label="Nueva contraseña"
            name="password"
            value={form.password}
            onChange={handleChange}
            show={show.new}
            onToggle={() => toggleShow("new")}
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            show={show.confirm}
            onToggle={() => toggleShow("confirm")}
          />
        </div>

        {/* Strength hint */}
        {form.password.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 3,
                  flex: 1,
                  borderRadius: 4,
                  background:
                    form.password.length >= i * 3
                      ? i <= 1
                        ? "#ef4444"
                        : i <= 2
                        ? "#f97316"
                        : i <= 3
                        ? "#eab308"
                        : "#22c55e"
                      : "#e2e8f0",
                  transition: "background 0.2s",
                }}
              />
            ))}
            <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
              {form.password.length < 4
                ? "Muy corta"
                : form.password.length < 7
                ? "Débil"
                : form.password.length < 10
                ? "Media"
                : "Fuerte"}
            </span>
          </div>
        )}

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
            Contraseña actualizada correctamente
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
                Actualizando…
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}