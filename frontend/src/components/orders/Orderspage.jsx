import { useState, useEffect, useCallback } from "react"

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STEPS = [
  { key: "nuevo",          short: "Recibido",  label: "Pedido recibido",     color: "#6366f1" },
  { key: "en_preparacion", short: "Preparando",label: "En preparación",      color: "#f59e0b" },
  { key: "empaquetando",   short: "Embalando", label: "Empaquetando",        color: "#f97316" },
  { key: "listo_envio",    short: "Listo",     label: "Listo para envío",    color: "#3b82f6" },
  { key: "enviado",        short: "En camino", label: "En camino",           color: "#8b5cf6" },
  { key: "completado",     short: "Entregado", label: "Entregado",           color: "#10b981" },
]

const STATUS_IDX = STEPS.reduce((a, s, i) => { a[s.key] = i; return a }, {})

const STATUS_META = {
  nuevo:          { label: "Recibido",   bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  en_preparacion: { label: "Preparando", bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  empaquetando:   { label: "Embalando",  bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  listo_envio:    { label: "Listo",      bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  enviado:        { label: "En camino",  bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  completado:     { label: "Entregado",  bg: "#d1fae5", text: "#064e3b", dot: "#10b981" },
  cancelado:      { label: "Cancelado",  bg: "#fee2e2", text: "#7f1d1d", dot: "#ef4444" },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const euro    = (v) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v ?? 0)
const dtFull  = (d) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long",  year: "numeric" })
const dtShort = (d) => new Date(d).toLocaleString ("es-ES", { day: "numeric",  month: "short", hour: "2-digit", minute: "2-digit" })

const isActive = (status) => status !== "completado" && status !== "cancelado"

// ─── API ─────────────────────────────────────────────────────────────────────
async function fetchUserOrders() {
  const res = await fetch("/api/orders/my", { headers: { "Accept": "application/json" } })
  if (!res.ok) throw new Error("Error al obtener pedidos")
  return res.json()
}

async function fetchOrderDetail(tracking) {
  const res = await fetch(`/api/orders/track/${tracking}`, { headers: { "Accept": "application/json" } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Server error")
  return res.json()
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  package:  (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>,
  truck:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  check:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/></svg>,
  copy:     (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  arrow:    (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>,
  back:     (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>,
  x:        (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  location: (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  calendar: (sz=16) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  spin:     (sz=16) => <svg style={{animation:"spin 0.8s linear infinite"}} width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>,
  empty:    (sz=48) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>,
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: meta.bg, color: meta.text,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
      {meta.label}
    </span>
  )
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button onClick={handleCopy} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
      background: copied ? "#f0fdf4" : "#fff",
      color: copied ? "#059669" : "#64748b",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      transition: "all 0.2s", fontFamily: "inherit",
    }}>
      {copied ? Icon.check(12) : Icon.copy(12)}
      {copied ? "Copiado" : "Copiar"}
    </button>
  )
}

// ─── STEPPER ─────────────────────────────────────────────────────────────────
function MiniStepper({ status }) {
  const ci   = STATUS_IDX[status] ?? 0
  const done = status === "completado"
  const pct  = ci === 0 ? 0 : (ci / (STEPS.length - 1)) * 100

  return (
    <div style={{ position: "relative", paddingTop: 4 }}>
      {/* Track */}
      <div style={{ position: "absolute", top: 17, left: 12, right: 12, height: 2, background: "#f1f5f9", borderRadius: 99 }} />
      <div style={{
        position: "absolute", top: 17, left: 12, height: 2, borderRadius: 99,
        background: done ? "#10b981" : "#f97316",
        width: `calc(${pct}% - ${pct > 0 ? 8 : 0}px)`,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        {STEPS.map((s, i) => {
          const isDone   = i < ci
          const isActive = i === ci
          const color    = done ? "#10b981" : "#f97316"
          return (
            <div key={s.key} title={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isDone || isActive ? color : "#fff",
                border: `2px solid ${isDone || isActive ? color : "#e2e8f0"}`,
                color: isDone || isActive ? "#fff" : "#cbd5e1",
                boxShadow: isActive ? `0 0 0 4px ${done ? "rgba(16,185,129,0.15)" : "rgba(249,115,22,0.15)"}` : "none",
                transition: "all 0.3s",
              }}>
                {isDone
                  ? <span style={{ color: "#fff" }}>{Icon.check(12)}</span>
                  : <span style={{ fontSize: 9, fontWeight: 800 }}>{i + 1}</span>
                }
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.03em",
                color: isActive ? (done ? "#047857" : "#c2410c") : isDone ? "#94a3b8" : "#cbd5e1",
                textAlign: "center", lineHeight: 1.2,
              }}>{s.short}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────
function Timeline({ events, status }) {
  const safe    = Array.isArray(events) ? events : []
  const nextIdx = Math.min((STATUS_IDX[status] ?? 0) + 1, STEPS.length - 1)
  const nextStep = status !== "completado" ? STEPS[nextIdx] : null

  if (safe.length === 0) return (
    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Sin historial disponible.</p>
  )

  return (
    <div>
      {[...safe].reverse().map((ev, i) => {
        const step = STEPS.find(s => s.key === ev.status)
        const isLast = i === 0
        return (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < safe.length - 1 ? 0 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", marginTop: 3,
                background: isLast ? "#f97316" : "#e2e8f0",
                boxShadow: isLast ? "0 0 0 3px rgba(249,115,22,0.2)" : "none",
                flexShrink: 0, transition: "all 0.3s",
              }} />
              {i < safe.length - 1 && (
                <div style={{ width: 1, flex: 1, background: "#f1f5f9", margin: "4px 0", minHeight: 24 }} />
              )}
            </div>
            <div style={{ paddingBottom: i < safe.length - 1 ? 18 : 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{step?.label ?? ev.status}</p>
              {ev.note && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0", lineHeight: 1.5 }}>{ev.note}</p>}
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>{dtShort(ev.date)}</p>
            </div>
          </div>
        )
      })}
      {nextStep && (
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 3, background: "#f8fafc", border: "1.5px dashed #e2e8f0" }} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, margin: 0 }}>{nextStep.label}</p>
            <p style={{ fontSize: 11, color: "#e2e8f0", margin: "1px 0 0" }}>Próxima etapa</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ORDER DETAIL PANEL ───────────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)
  const ci   = STATUS_IDX[order.status] ?? 0
  const done = order.status === "completado"
  const pct  = Math.round((ci / (STEPS.length - 1)) * 100)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOrderDetail(order.order_tracking)
        setDetail(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
    // Lock scroll
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [order.order_tracking])

  const items    = Array.isArray(detail?.items) ? detail.items : []
  const totalQty = items.reduce((a, i) => a + (i.quantity || 0), 0)

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)", zIndex: 40,
        animation: "fadeIn 0.2s ease",
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(640px, 100vw)",
        background: "#fff", zIndex: 50, overflowY: "auto",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.15)",
        animation: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, background: "#fff",
          borderBottom: "1px solid #f1f5f9", zIndex: 1,
          padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Detalle del pedido</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                #{order.id}
              </h2>
              {order.order_tracking && (
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                  color: "#f97316", background: "#fff7ed",
                  padding: "2px 8px", borderRadius: 99, border: "1px solid #fed7aa",
                }}>{order.order_tracking}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, border: "1px solid #e2e8f0",
            background: "#fff", color: "#64748b", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b" }}
          >
            {Icon.x(14)}
          </button>
        </div>

        <div style={{ padding: "24px 28px", flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: "#94a3b8" }}>
              {Icon.spin(28)}
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#ef4444", fontWeight: 600 }}>Error al cargar el detalle</p>
            </div>
          ) : (
            <>
              {/* Status hero */}
              <div style={{
                borderRadius: 20, padding: "24px",
                background: done ? "linear-gradient(135deg,#ecfdf5,#f0fdf4)" : "linear-gradient(135deg,#fff7ed,#fff)",
                border: done ? "1px solid #a7f3d0" : "1px solid #fed7aa",
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: done ? "#059669" : "#ea580c", margin: "0 0 4px" }}>
                      {done ? "✓ Completado" : "En proceso"}
                    </p>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                      {STEPS.find(s => s.key === order.status)?.label}
                    </h3>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <MiniStepper status={order.status} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Paso {ci + 1} de {STEPS.length}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: done ? "#059669" : "#f97316" }}>{pct}% completado</span>
                </div>
              </div>

              {/* Products */}
              <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                    Productos · {totalQty} {totalQty === 1 ? "ud." : "uds."}
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{euro(detail?.total_amount)}</span>
                </div>
                {items.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((item, idx) => (
                      <div key={item.id ?? idx} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 12,
                        background: "#f8fafc", border: "1px solid #f1f5f9",
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: "#fff", border: "1px solid #e2e8f0",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1",
                        }}>
                          {Icon.package(15)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product_name}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>×{item.quantity} · {euro(item.unit_price)} ud.</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, flexShrink: 0 }}>{euro(item.unit_price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#cbd5e1", textAlign: "center", padding: "16px 0", margin: 0 }}>Sin productos</p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{euro(detail?.total_amount)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "20px 22px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>Historial</p>
                <Timeline events={detail?.timeline} status={order.status} />
              </div>

              {/* Address */}
              {(detail?.address || detail?.city) && (
                <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "20px 22px" }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Dirección de entrega</p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                      {Icon.location(14)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{detail.address}</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>{[detail.city, detail.country].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── ORDER CARD ───────────────────────────────────────────────────────────────
function OrderCard({ order, onViewDetail }) {
  const active = isActive(order.status)
  const trackingUrl = order.order_tracking
    ? `/seguimiento?ref=${order.order_tracking}`
    : null

  return (
    <div style={{
      background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20,
      padding: "20px 22px", transition: "box-shadow 0.2s, border-color 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = "#e2e8f0" }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#f1f5f9" }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>#{order.id}</span>
            {order.order_tracking && (
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                color: "#f97316", background: "#fff7ed",
                padding: "2px 8px", borderRadius: 99, border: "1px solid #fed7aa",
              }}>{order.order_tracking}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
            {Icon.calendar(11)}
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{dtFull(order.created_at)}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Info row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12,
        background: "#f8fafc", border: "1px solid #f1f5f9",
        marginBottom: 16,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "#fff7ed", border: "1px solid #fed7aa",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316",
        }}>
          {Icon.truck(16)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {order.full_name || "—"}
          </p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
            {order.items_count ? `${order.items_count} producto${order.items_count !== 1 ? "s" : ""}` : "Pedido"}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{euro(order.total_amount)}</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onViewDetail(order)} style={{
          flex: 1, minWidth: 120, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
          color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
          transition: "all 0.2s", fontFamily: "inherit",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569" }}
        >
          {Icon.package(14)} Ver detalle
        </button>

        {active && trackingUrl ? (
          <a href={trackingUrl} style={{
            flex: 1, minWidth: 120, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#f97316", border: "none", borderRadius: 10,
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            textDecoration: "none", transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
            onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
          >
            {Icon.truck(14)} Ver seguimiento {Icon.arrow(12)}
          </a>
        ) : active && order.order_tracking ? (
          <div style={{ flex: 1, minWidth: 120 }}>
            <CopyButton text={order.order_tracking} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "80px 24px",
      background: "#fff", border: "1px solid #f1f5f9",
      borderRadius: 24,
    }}>
      <div style={{ color: "#e2e8f0", marginBottom: 20 }}>{Icon.empty(52)}</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Aún no tienes pedidos</h3>
      <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px", lineHeight: 1.6 }}>Cuando realices tu primer pedido<br />aparecerá aquí.</p>
      <a href="/tienda" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#f97316", color: "#fff",
        padding: "12px 24px", borderRadius: 12,
        fontSize: 14, fontWeight: 700, textDecoration: "none",
        transition: "background 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
        onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
      >
        Ir a la tienda {Icon.arrow(14)}
      </a>
    </div>
  )
}

// ─── FILTER TABS ──────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",      label: "Todos" },
  { key: "active",   label: "En proceso" },
  { key: "done",     label: "Completados" },
  { key: "canceled", label: "Cancelados" },
]

function FilterTabs({ active, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FILTERS.map(f => {
        const isActive = f.key === active
        return (
          <button key={f.key} onClick={() => onChange(f.key)} style={{
            padding: "7px 14px", borderRadius: 99, border: "none",
            background: isActive ? "#0f172a" : "#f1f5f9",
            color: isActive ? "#fff" : "#64748b",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {f.label}
            {counts[f.key] > 0 && (
              <span style={{
                background: isActive ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                color: isActive ? "#fff" : "#64748b",
                padding: "1px 6px", borderRadius: 99, fontSize: 10, fontWeight: 800,
              }}>{counts[f.key]}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [filter,      setFilter]      = useState("all")
  const [detailOrder, setDetailOrder] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUserOrders()
        setOrders(Array.isArray(data) ? data : [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = orders.filter(o => {
    if (filter === "active")   return isActive(o.status)
    if (filter === "done")     return o.status === "completado"
    if (filter === "canceled") return o.status === "cancelado"
    return true
  })

  const counts = {
    all:      orders.length,
    active:   orders.filter(o => isActive(o.status)).length,
    done:     orders.filter(o => o.status === "completado").length,
    canceled: orders.filter(o => o.status === "cancelado").length,
  }

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.03em" }}>
              Mis pedidos
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
              Consulta el estado y detalle de todos tus pedidos.
            </p>
          </div>
          {!loading && !error && orders.length > 0 && (
            <div style={{
              padding: "10px 18px", borderRadius: 12,
              background: "#f8fafc", border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{orders.length}</span>
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{orders.length === 1 ? "pedido" : "pedidos"}</span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0", color: "#94a3b8", gap: 12 }}>
            {Icon.spin(24)}
            <span style={{ fontSize: 14 }}>Cargando pedidos…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: "#fff", border: "1px solid #fee2e2", borderRadius: 20,
            padding: "48px 40px", textAlign: "center",
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", margin: "0 0 8px" }}>Error al cargar los pedidos</p>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 24px" }}>No hemos podido obtener tus pedidos. Por favor, recarga la página.</p>
            <button onClick={() => window.location.reload()} style={{
              padding: "10px 24px", background: "#f97316", border: "none", borderRadius: 10,
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>Reintentar</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Filters */}
                <div style={{ marginBottom: 20 }}>
                  <FilterTabs active={filter} onChange={setFilter} counts={counts} />
                </div>

                {filtered.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "60px 24px",
                    background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20,
                  }}>
                    <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>No hay pedidos en esta categoría.</p>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                    gap: 16,
                  }}>
                    {filtered.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onViewDetail={setDetailOrder}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Detail panel */}
        {detailOrder && (
          <OrderDetailPanel order={detailOrder} onClose={() => setDetailOrder(null)} />
        )}
      </div>
    </>
  )
}