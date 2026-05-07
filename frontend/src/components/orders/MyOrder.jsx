import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE  = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const TOKEN_KEY = "auth_token"   // ← clave exacta en localStorage

const STATUS_CONFIG = {
  nuevo:          { label: "Recibido",    color: "#6366f1", bg: "#eef2ff", dot: "#818cf8" },
  en_preparacion: { label: "Preparando",  color: "#f59e0b", bg: "#fffbeb", dot: "#fbbf24" },
  empaquetando:   { label: "Embalando",   color: "#8b5cf6", bg: "#f5f3ff", dot: "#a78bfa" },
  listo_envio:    { label: "Listo",       color: "#0ea5e9", bg: "#f0f9ff", dot: "#38bdf8" },
  enviado:        { label: "En camino",   color: "#f97316", bg: "#fff7ed", dot: "#fb923c" },
  completado:     { label: "Entregado",   color: "#10b981", bg: "#ecfdf5", dot: "#34d399" },
  cancelado:      { label: "Cancelado",   color: "#ef4444", bg: "#fef2f2", dot: "#f87171" },
}

const STATUS_PROGRESS = {
  nuevo: 10, en_preparacion: 30, empaquetando: 50,
  listo_envio: 70, enviado: 85, completado: 100, cancelado: 0,
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
const euro = (v) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v ?? 0)

const dtFull = (d) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })

const dtShort = (d) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })

// ─── API ─────────────────────────────────────────────────────────────────────
// FIX 1: token se lee de localStorage en el momento exacto del fetch, nunca antes.
//         Elimina la ventana de render donde el prop llegaba null y la llamada
//         salía sin Authorization header.
// FIX 2: cache: "no-store" + "Cache-Control: no-store" evitan el 304 que
//         hacía que el navegador sirviera la respuesta vacía cacheada.
async function apiFetch(path) {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) throw new Error("NO_TOKEN")

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization:   `Bearer ${token}`,
      Accept:          "application/json",
      "Cache-Control": "no-store",
    },
    cache: "no-store",
  })

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  return res.json()
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
// Ya no recibe token como argumento — lo lee apiFetch directamente
function useMyOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch("/api/orders/my")
      // normaliza tanto [] como { data: [] } de Laravel
      setOrders(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (e) {
      if (e.message === "NO_TOKEN") {
        // token aún no disponible (hydration race), reintenta una sola vez
        setTimeout(fetchOrders, 300)
        return
      }
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}

function useOrderDetail() {
  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const load = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    setDetail(null)
    try {
      const data = await apiFetch(`/api/orders/my/${id}`)
      setDetail(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setDetail(null)
    setError(null)
  }, [])

  return { detail, loading, error, load, clear }
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.nuevo
  const pad = size === "sm" ? "3px 10px" : "5px 14px"
  const fs  = size === "sm" ? 11 : 12
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      fontSize: fs, fontWeight: 700, letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0,
        boxShadow: `0 0 0 2px ${cfg.dot}33`,
      }} />
      {cfg.label}
    </span>
  )
}

function ProgressBar({ status }) {
  const pct       = STATUS_PROGRESS[status] ?? 0
  const done      = status === "completado"
  const cancelled = status === "cancelado"
  return (
    <div style={{ height: 3, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99, width: `${pct}%`,
        background: cancelled ? "#fca5a5" : done ? "#34d399" : "#f97316",
        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20,
      padding: 24, display: "flex", flexDirection: "column", gap: 16,
    }}>
      {[120, 80, 60, 100].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 18 : 14, width: `${w}%`, maxWidth: w * 2,
          borderRadius: 8,
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }} />
      ))}
    </div>
  )
}

function OrderCard({ order, onDetail, onTrack }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#e2e8f0" : "#f1f5f9"}`,
        borderRadius: 20, padding: 24,
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(15,23,42,0.07)" : "0 1px 4px rgba(15,23,42,0.03)",
        cursor: "default", display: "flex", flexDirection: "column", gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.06em" }}>
              PED-{String(order.id).padStart(3, "0")}
            </span>
            {order.order_tracking && (
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: "monospace",
                color: "#f97316", background: "#fff7ed",
                padding: "1px 7px", borderRadius: 99, border: "1px solid #fed7aa",
              }}>
                {order.order_tracking}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{dtShort(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ProgressBar status={order.status} />

      <div style={{ display: "flex", gap: 20 }}>
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>{euro(order.total_amount)}</p>
        </div>
        <div style={{ width: 1, background: "#f1f5f9" }} />
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Productos</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            {order.items_count ?? 0}
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginLeft: 4 }}>
              {(order.items_count ?? 0) === 1 ? "ud." : "uds."}
            </span>
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: "1px solid #f8fafc" }}>
        <button
          onClick={() => onDetail(order.id)}
          style={{
            flex: 1, height: 38, border: "1.5px solid #e2e8f0", background: "#fff",
            borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#475569",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.color = "#0f172a" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569" }}
        >
          Ver detalles
        </button>
        {order.order_tracking && order.status !== "cancelado" && (
          <button
            onClick={() => onTrack(order.order_tracking)}
            style={{
              flex: 1, height: 38, border: "none", background: "#f97316",
              borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
            onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
          >
            Seguimiento
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      gridColumn: "1 / -1", textAlign: "center", padding: "72px 40px",
      background: "#fff", borderRadius: 24, border: "1.5px dashed #e2e8f0",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: "#f8fafc", border: "1.5px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        Aún no tienes pedidos
      </h3>
      <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
        Cuando realices tu primer pedido aparecerá aquí.
      </p>
    </div>
  )
}

function InfoCard({ icon, iconBg, iconBorder, label, children }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 16, padding: "14px 16px", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: iconBg, border: `1px solid ${iconBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{label}</p>
      </div>
      {children}
    </div>
  )
}

function OrderModal({ detail, loading, error, onClose, onTrack }) {
  const overlayRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const items  = Array.isArray(detail?.items) ? detail.items : []
  const status = detail?.status ?? "nuevo"
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.nuevo

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        background: `rgba(2,6,23,${mounted ? 0.6 : 0})`,
        backdropFilter: `blur(${mounted ? 8 : 0}px)`,
        transition: "background 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 28, width: "100%", maxWidth: 640,
        maxHeight: "90vh", overflowY: "auto", position: "relative",
        boxShadow: "0 32px 80px rgba(2,6,23,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
        transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        opacity: mounted ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}>
        <div style={{ height: 4, borderRadius: "28px 28px 0 0", background: detail ? cfg.dot : "#e2e8f0" }} />

        <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            {detail ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                    PED-{String(detail.id).padStart(3, "0")}
                  </h2>
                  {detail.order_tracking && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                      color: "#f97316", background: "#fff7ed",
                      padding: "2px 8px", borderRadius: 99, border: "1px solid #fed7aa",
                    }}>
                      {detail.order_tracking}
                    </span>
                  )}
                  <StatusBadge status={status} size="md" />
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{dtFull(detail.created_at)}</p>
              </>
            ) : (
              <div style={{ width: 180, height: 20, borderRadius: 8, background: "#f1f5f9" }} />
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0",
              background: "#fff", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#94a3b8",
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#94a3b8" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[100, 80, 90, 70, 85].map((w, i) => (
                <div key={i} style={{
                  height: 14, width: `${w}%`, borderRadius: 8,
                  background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite",
                }} />
              ))}
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 14, color: "#ef4444", margin: 0 }}>Error cargando detalle del pedido.</p>
            </div>
          )}

          {detail && !loading && (
            <>
              <section>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
                  Productos
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((item, idx) => (
                    <div key={item.id ?? idx} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 14px", borderRadius: 14,
                      background: "#f8fafc", border: "1px solid #f1f5f9",
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "#fff", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1",
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                          <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.product_name}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
                          {euro(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, flexShrink: 0 }}>
                        {euro((item.unit_price ?? 0) * (item.quantity ?? 1))}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 0 0", marginTop: 4, borderTop: "1px solid #f1f5f9",
                }}>
                  <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>Total del pedido</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                    {euro(detail.total_amount)}
                  </span>
                </div>
              </section>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(detail.address || detail.city) && (
                  <InfoCard icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  } iconBg="#eff6ff" iconBorder="#bfdbfe" label="Dirección de entrega">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{detail.address}</p>
                    {detail.postal_code && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{detail.postal_code}</p>}
                    <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                      {[detail.city, detail.country].filter(Boolean).join(", ")}
                    </p>
                  </InfoCard>
                )}

                {detail.payment && (
                  <InfoCard icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  } iconBg="#f0fdf4" iconBorder="#bbf7d0" label="Pago">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, textTransform: "capitalize" }}>
                      {detail.payment.provider ?? "—"}
                    </p>
                    {detail.payment.payment_status && (
                      <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0", textTransform: "capitalize" }}>
                        {detail.payment.payment_status}
                      </p>
                    )}
                    {detail.payment.transaction_id && (
                      <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0", fontFamily: "monospace" }}>
                        #{detail.payment.transaction_id}
                      </p>
                    )}
                  </InfoCard>
                )}

                {(detail.phone || detail.email) && (
                  <InfoCard icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  } iconBg="#f5f3ff" iconBorder="#ddd6fe" label="Contacto">
                    {detail.full_name && <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{detail.full_name}</p>}
                    {detail.email && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{detail.email}</p>}
                    {detail.phone && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{detail.phone}</p>}
                  </InfoCard>
                )}
              </div>

              {detail.order_tracking && detail.status !== "cancelado" && (
                <button
                  onClick={() => { onClose(); onTrack(detail.order_tracking) }}
                  style={{
                    width: "100%", height: 48, background: "#f97316", border: "none",
                    borderRadius: 14, fontSize: 14, fontWeight: 700, color: "#fff",
                    cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
                >
                  Ver seguimiento en tiempo real
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterTabs({ active, onChange, counts }) {
  const tabs = [
    { key: "all",        label: "Todos" },
    { key: "en_curso",   label: "En curso" },
    { key: "completado", label: "Entregados" },
    { key: "cancelado",  label: "Cancelados" },
  ]
  return (
    <div style={{ display: "flex", gap: 4, background: "#f8fafc", padding: 4, borderRadius: 14, border: "1px solid #f1f5f9" }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1, height: 34, border: "none", borderRadius: 10,
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
            background: active === t.key ? "#fff" : "transparent",
            color: active === t.key ? "#0f172a" : "#94a3b8",
            boxShadow: active === t.key ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
          }}
        >
          {t.label}
          {counts[t.key] > 0 && (
            <span style={{
              marginLeft: 5, fontSize: 10, fontWeight: 800,
              color: active === t.key ? "#f97316" : "#cbd5e1",
            }}>
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// IMPORTANTE: ya no recibe `token` como prop.
// Si el padre lo pasaba como <MyOrders token={...} />, simplemente
// elimina esa prop — el componente ya no la necesita.
export default function MyOrders() {
  const navigate = useNavigate()
  const { orders, loading, error, refetch }                                         = useMyOrders()
  const { detail, loading: detailLoading, error: detailError, load: loadDetail, clear } = useOrderDetail()

  const [filter, setFilter]       = useState("all")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (document.getElementById("myorders-style")) return
    const s = document.createElement("style")
    s.id = "myorders-style"
    s.textContent = `
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(s)
  }, [])

  const openDetail = useCallback((id) => {
    loadDetail(id)
    setModalOpen(true)
  }, [loadDetail])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    clear()
  }, [clear])

  const handleTrack = useCallback((trackingCode) => {
    navigate(`/tracking/${trackingCode}`)
  }, [navigate])

  const counts = {
    all:        orders.length,
    en_curso:   orders.filter(o => !["completado", "cancelado"].includes(o.status)).length,
    completado: orders.filter(o => o.status === "completado").length,
    cancelado:  orders.filter(o => o.status === "cancelado").length,
  }

  const filtered =
    filter === "all"      ? orders :
    filter === "en_curso" ? orders.filter(o => !["completado", "cancelado"].includes(o.status)) :
    orders.filter(o => o.status === filter)

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 1100, margin: "0 auto" }}>

      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>
            Mis pedidos
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
            {loading ? "Cargando…" : `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"} en total`}
          </p>
        </div>

        {!loading && !error && orders.length > 0 && (
          <div style={{ minWidth: 320 }}>
            <FilterTabs active={filter} onChange={setFilter} counts={counts} />
          </div>
        )}
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16,
          padding: "20px 24px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4m0 4h.01"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", margin: 0 }}>Error cargando pedidos</p>
            <p style={{ fontSize: 13, color: "#dc2626", margin: "2px 0 0" }}>Comprueba tu conexión e inténtalo de nuevo.</p>
          </div>
          <button onClick={refetch} style={{
            padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: 10,
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Reintentar
          </button>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
            ? <EmptyState />
            : filtered.map((order, i) => (
                <div key={order.id} style={{ animation: "fadeIn 0.3s ease both", animationDelay: `${i * 40}ms` }}>
                  <OrderCard order={order} onDetail={openDetail} onTrack={handleTrack} />
                </div>
              ))
        }
      </div>

      {modalOpen && (
        <OrderModal
          detail={detail}
          loading={detailLoading}
          error={detailError}
          onClose={closeModal}
          onTrack={handleTrack}
        />
      )}
    </div>
  )
}