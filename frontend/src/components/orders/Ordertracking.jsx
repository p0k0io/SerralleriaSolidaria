import { useState, useEffect, useRef } from "react"

/* ─── STEPS ─────────────────────────────────────────── */
const STEPS = [
  {
    key: "nuevo",
    short: "Recibido",
    label: "Pedido recibido",
    desc: "Hemos recibido tu pedido y el pago ha sido procesado correctamente.",
    icon: (c) => (
      <svg width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
      </svg>
    ),
  },
  {
    key: "en_preparacion",
    short: "Preparando",
    label: "En preparación",
    desc: "Nuestro equipo está preparando tu pedido con cuidado.",
    icon: (c) => (
      <svg width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    key: "empaquetando",
    short: "Embalando",
    label: "Empaquetando",
    desc: "Tu pedido está siendo embalado y protegido para el envío.",
    icon: (c) => (
      <svg width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12m9-5-9 5-9-5m0 0 9-5 9 5"/><path d="M3 17l9 5 9-5"/>
      </svg>
    ),
  },
  {
    key: "listo_envio",
    short: "Listo",
    label: "Listo para envío",
    desc: "Tu pedido está listo y esperando al transportista.",
    icon: (c) => (
      <svg width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    key: "enviado",
    short: "En camino",
    label: "En camino",
    desc: "Tu pedido está en ruta. Pronto llegará a tu puerta.",
    icon: (c) => (
      <svg width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14m-7-7 7 7-7 7"/>
      </svg>
    ),
  },
  {
    key: "completado",
    short: "Entregado",
    label: "Entregado",
    desc: "¡Tu pedido ha llegado! Esperamos que lo disfrutes.",
    icon: (c) => (
      <svg width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
      </svg>
    ),
  },
]

const IDX = STEPS.reduce((a, s, i) => { a[s.key] = i; return a }, {})

/* ─── FORMATTERS ─────────────────────────────────────── */
const euro = (v) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v ?? 0)
const dtFull = (d) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
const dtShort = (d) => new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

/* ─── MOCK API ───────────────────────────────────────── */
async function fetchOrder(id) {
  await new Promise(r => setTimeout(r, 1100))
  if (id === "99999") return null
  return {
    id,
    full_name: "María García",
    email: "m.garcia@email.com",
    status: "en_preparacion",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    address: "Calle Mayor, 14, 2ºA",
    city: "Madrid",
    country: "España",
    total_amount: 187.50,
    items: [
      { id: 1, product_name: "Cerradura de seguridad BL-300", sku: "BL-300-S", quantity: 1, unit_price: 89.95 },
      { id: 2, product_name: "Bombín de alta seguridad", sku: "BOMB-MED", quantity: 2, unit_price: 48.77 },
    ],
    timeline: [
      { status: "nuevo", date: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), note: "Pedido confirmado y pago procesado." },
      { status: "en_preparacion", date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), note: "Nuestro equipo ha comenzado la preparación." },
    ],
  }
}

/* ─── ANIMATED NUMBER ────────────────────────────────── */
function AnimNum({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const dur = 900
    const from = 0
    const to = parseFloat(value) || 0
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * ease)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value])
  return <span>{prefix}{display.toFixed(2).replace(".", ",")}{suffix}</span>
}

/* ─── SEARCH ─────────────────────────────────────────── */
function SearchBox({ onSearch, loading }) {
  const [val, setVal] = useState("")
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (val.trim()) onSearch(val.trim()) }}
      style={{ display: "flex", gap: 8, width: "100%" }}
    >
      <div style={{ position: "relative", flex: 1 }}>
        <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#cbd5e1", pointerEvents: "none" }}
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          ref={ref}
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Número de pedido — ej. 1234"
          style={{
            width: "100%", height: 52, paddingLeft: 40, paddingRight: 16,
            border: "1.5px solid #e2e8f0", borderRadius: 14,
            fontSize: 15, color: "#0f172a", background: "#fff",
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
            fontFamily: "inherit",
          }}
          onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)" }}
          onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none" }}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !val.trim()}
        style={{
          height: 52, paddingLeft: 24, paddingRight: 24,
          background: loading ? "#fdba74" : "#f97316",
          border: "none", borderRadius: 14,
          color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", gap: 8,
          transition: "background 0.2s, transform 0.1s",
          flexShrink: 0, fontFamily: "inherit",
          opacity: !val.trim() ? 0.5 : 1,
        }}
        onMouseEnter={e => { if (!loading && val.trim()) e.currentTarget.style.background = "#ea580c" }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#f97316" }}
      >
        {loading
          ? <svg style={{ animation: "spin 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
          : <>Consultar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></>
        }
      </button>
    </form>
  )
}

/* ─── STEPPER ────────────────────────────────────────── */
function Stepper({ status }) {
  const ci = IDX[status] ?? 0
  const done = status === "completado"

  return (
    <div style={{ position: "relative", padding: "0 0 8px" }}>
      {/* track */}
      <div style={{ position: "absolute", top: 20, left: 20, right: 20, height: 2, background: "#f1f5f9", borderRadius: 99, zIndex: 0 }} />
      <div style={{
        position: "absolute", top: 20, left: 20, height: 2,
        background: done ? "#10b981" : "#f97316",
        borderRadius: 99, zIndex: 1,
        width: ci === 0 ? 0 : `calc(${(ci / (STEPS.length - 1)) * 100}% - 0px)`,
        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        {STEPS.map((s, i) => {
          const isDone = i < ci
          const isActive = i === ci

          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${isDone || isActive ? (done ? "#10b981" : "#f97316") : "#e2e8f0"}`,
                background: isDone || isActive ? (done ? "#10b981" : "#f97316") : "#fff",
                color: isDone || isActive ? "#fff" : "#cbd5e1",
                transition: "all 0.3s ease",
                boxShadow: isActive ? `0 0 0 5px ${done ? "rgba(16,185,129,0.12)" : "rgba(249,115,22,0.14)"}` : "none",
              }}>
                {isDone
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/></svg>
                  : s.icon(16)
                }
              </div>
              <p style={{
                fontSize: 10, fontWeight: 700, textAlign: "center",
                letterSpacing: "0.03em", lineHeight: 1.3,
                color: isActive ? (done ? "#047857" : "#c2410c") : isDone ? "#64748b" : "#cbd5e1",
                transition: "color 0.3s",
              }}>
                {s.short}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── TIMELINE ───────────────────────────────────────── */
function Timeline({ events, status }) {
  const nextStep = STEPS[Math.min(IDX[status] + 1, STEPS.length - 1)]

  return (
    <div>
      {events.map((ev, i) => {
        const step = STEPS.find(s => s.key === ev.status)
        const last = i === events.length - 1
        return (
          <div key={i} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", marginTop: 3, flexShrink: 0,
                background: last ? "#f97316" : "#e2e8f0",
                boxShadow: last ? "0 0 0 3px rgba(249,115,22,0.2)" : "none",
                transition: "all 0.3s",
              }} />
              {i < events.length - 1 && (
                <div style={{ width: 1, flex: 1, background: "#f1f5f9", margin: "4px 0", minHeight: 28 }} />
              )}
            </div>
            <div style={{ paddingBottom: last ? 0 : 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0, lineHeight: 1.3 }}>{step?.label}</p>
              {ev.note && <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0", lineHeight: 1.5 }}>{ev.note}</p>}
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>{dtShort(ev.date)}</p>
            </div>
          </div>
        )
      })}

      {status !== "completado" && nextStep && (
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 3, background: "#f1f5f9", border: "1.5px dashed #e2e8f0" }} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, margin: 0 }}>{nextStep.label}</p>
            <p style={{ fontSize: 11, color: "#e2e8f0", margin: "2px 0 0" }}>Próxima actualización</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── IDLE SCREEN ────────────────────────────────────── */
function IdleScreen({ onSearch, loading }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fff 50%, #fff7ed 100%)",
        border: "1px solid #fed7aa",
        borderRadius: 24, padding: "48px 40px",
        textAlign: "center", marginBottom: 24,
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(249,115,22,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.04)", pointerEvents: "none" }} />

        {/* Truck icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: "#fff",
          border: "1.5px solid #fed7aa",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 4px 24px rgba(249,115,22,0.1)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
          ¿Dónde está mi pedido?
        </h2>
        <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 32px", lineHeight: 1.6 }}>
          Introduce tu número de pedido para ver<br />el estado actualizado en tiempo real.
        </p>

        <div style={{ position: "relative", zIndex: 1 }}>
          <SearchBox onSearch={onSearch} loading={loading} />
        </div>

        <p style={{ fontSize: 12, color: "#94a3b8", margin: "14px 0 0" }}>
          Encontrarás tu número en el email de confirmación
        </p>
      </div>

      {/* Process preview */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "24px 28px" }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px" }}>
          Así funciona el proceso
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{
              display: "flex", flexDirection: "column", gap: 8,
              padding: "14px 12px", borderRadius: 14,
              background: "#fafafa", border: "1px solid #f1f5f9",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "#fff7ed", color: "#f97316",
                border: "1px solid #fed7aa",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {s.icon(16)}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#334155", margin: 0, lineHeight: 1.3 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── RESULT SCREEN ──────────────────────────────────── */
function ResultScreen({ order, onReset }) {
  const ci = IDX[order.status] ?? 0
  const done = order.status === "completado"
  const step = STEPS.find(s => s.key === order.status)
  const totalQty = order.items?.reduce((a, i) => a + i.quantity, 0) ?? 0
  const pct = Math.round((ci / (STEPS.length - 1)) * 100)

  // Entry animation
  const [visible, setVisible] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>

      {/* ── STATUS HERO ── */}
      <div style={{
        borderRadius: 24, overflow: "hidden",
        border: done ? "1px solid #a7f3d0" : "1px solid #fed7aa",
        marginBottom: 20,
        background: done
          ? "linear-gradient(135deg, #ecfdf5, #f0fdf4)"
          : "linear-gradient(135deg, #fff7ed, #fff)",
      }}>

        {/* Top accent strip */}
        <div style={{ height: 4, background: done ? "#10b981" : "#f97316", width: "100%" }} />

        <div style={{ padding: "28px 32px 32px" }}>
          {/* Row: id + status badge + close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em" }}>
                PEDIDO #{order.id}
              </span>
              <span style={{ fontSize: 11, color: "#cbd5e1" }}>·</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{dtFull(order.created_at)}</span>
            </div>
            <button
              onClick={onReset}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, color: "#94a3b8", background: "none",
                border: "none", cursor: "pointer", padding: "4px 8px",
                borderRadius: 8, fontFamily: "inherit",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5m7-7-7 7 7 7"/>
              </svg>
              Otro pedido
            </button>
          </div>

          {/* Status + icon */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: done ? "#059669" : "#ea580c", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {done ? "✓ Completado" : "En proceso"}
              </p>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                {step?.label}
              </h2>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6, maxWidth: 380 }}>
                {step?.desc}
              </p>
            </div>

            <div style={{
              width: 72, height: 72, borderRadius: 20, flexShrink: 0,
              background: done ? "#ecfdf5" : "#fff7ed",
              border: done ? "1.5px solid #a7f3d0" : "1.5px solid #fed7aa",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: done ? "#10b981" : "#f97316",
              boxShadow: `0 8px 32px ${done ? "rgba(16,185,129,0.12)" : "rgba(249,115,22,0.12)"}`,
            }}>
              {step?.icon(30)}
            </div>
          </div>

          {/* Stepper */}
          <Stepper status={order.status} />

          {/* Progress label */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Paso {ci + 1} de {STEPS.length}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: done ? "#059669" : "#f97316" }}>
              {pct}% completado
            </span>
          </div>
        </div>
      </div>

      {/* ── GRID: products + (timeline & address) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Products */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Productos · {totalQty} {totalQty === 1 ? "ud." : "uds."}
            </p>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{euro(order.total_amount)}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {order.items?.map(item => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                background: "#f8fafc", border: "1px solid #f1f5f9",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "#fff", border: "1px solid #e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#cbd5e1",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                    <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.product_name}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontFamily: "monospace" }}>{item.sku}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{euro(item.unit_price * item.quantity)}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9",
          }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Total</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{euro(order.total_amount)}</span>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Timeline */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "22px 24px", flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 18px" }}>
              Historial
            </p>
            <Timeline events={order.timeline} status={order.status} />
          </div>

          {/* Shipping */}
          {(order.address || order.city) && (
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "18px 24px" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
                Dirección de entrega
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "#eff6ff", border: "1px solid #bfdbfe",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{order.address}</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>{[order.city, order.country].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── HELP BANNER ── */}
      <div style={{
        background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20,
        padding: "18px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "#fff7ed", border: "1px solid #fed7aa",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>¿Alguna duda sobre tu pedido?</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Respondemos en menos de 2 horas en horario laboral.</p>
          </div>
        </div>
        <a
          href="mailto:hola@tienda.com"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#f97316", color: "#fff",
            padding: "10px 20px", borderRadius: 12,
            fontSize: 13, fontWeight: 700, textDecoration: "none",
            transition: "background 0.2s", flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
          onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
        >
          Contactar
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  )
}

/* ─── NOT FOUND ──────────────────────────────────────── */
function NotFound({ id, onReset, onRetry }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{
        background: "#fff", border: "1px solid #fee2e2", borderRadius: 24,
        padding: "48px 40px", textAlign: "center", marginBottom: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "#fef2f2", border: "1px solid #fecaca",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            <path d="M11 8v4m0 4h.01"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Pedido no encontrado
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 4px", lineHeight: 1.6 }}>
          No hemos encontrado ningún pedido con el número
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 24px", fontFamily: "monospace" }}>
          #{id}
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
          Revisa que el número sea correcto. Lo encontrarás en el email de confirmación de tu compra.
        </p>
      </div>
      <SearchBox onSearch={onRetry} loading={false} />
      <button onClick={onReset} style={{ width: "100%", marginTop: 14, background: "none", border: "none", fontSize: 13, color: "#94a3b8", cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
        onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
      >
        ← Volver al inicio
      </button>
    </div>
  )
}

/* ─── ERROR ──────────────────────────────────────────── */
function ErrorScreen({ id, onReset, onRetry }) {
  return (
    <div style={{ maxWidth: 440 }}>
      <div style={{
        background: "#fff", border: "1px solid #fed7aa", borderRadius: 24,
        padding: "48px 40px", textAlign: "center", marginBottom: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "#fff7ed", border: "1px solid #fed7aa",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4m0 4h.01"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Error de conexión
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
          No hemos podido obtener la información de tu pedido. Por favor, inténtalo de nuevo.
        </p>
        <button
          onClick={() => onRetry(id)}
          style={{
            width: "100%", height: 48, background: "#f97316", border: "none",
            borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
          onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
        >
          Reintentar
        </button>
      </div>
      <button onClick={onReset} style={{ width: "100%", background: "none", border: "none", fontSize: 13, color: "#94a3b8", cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
        onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
      >
        ← Volver al inicio
      </button>
    </div>
  )
}

/* ─── SPIN KEYFRAME ──────────────────────────────────── */
const spinStyle = document.createElement("style")
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
document.head.appendChild(spinStyle)

/* ─── MAIN ───────────────────────────────────────────── */
export default function OrderTracking() {
  const [phase, setPhase] = useState("idle")
  const [order, setOrder] = useState(null)
  const [qid, setQid] = useState(null)

  async function search(id) {
    setPhase("loading")
    setQid(id)
    try {
      const res = await fetchOrder(id)
      res ? (setOrder(res), setPhase("found")) : setPhase("not_found")
    } catch {
      setPhase("error")
    }
  }

  function reset() { setPhase("idle"); setOrder(null); setQid(null) }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          Seguimiento de pedido
        </h1>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
          Consulta el estado de tu pedido en tiempo real.
        </p>
      </div>

      {(phase === "idle" || phase === "loading") && <IdleScreen onSearch={search} loading={phase === "loading"} />}
      {phase === "found" && order && <ResultScreen order={order} onReset={reset} />}
      {phase === "not_found" && <NotFound id={qid} onReset={reset} onRetry={search} />}
      {phase === "error" && <ErrorScreen id={qid} onReset={reset} onRetry={search} />}
    </div>
  )
}