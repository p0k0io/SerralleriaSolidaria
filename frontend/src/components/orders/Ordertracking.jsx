import { useState, useEffect } from "react"

/* ================= ESTADOS (igual que admin) ================= */
const STEPS = [
  {
    key: "nuevo",
    label: "Pedido recibido",
    desc: "Hemos recibido tu pedido y lo estamos revisando.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
      </svg>
    ),
  },
  {
    key: "en_preparacion",
    label: "En preparación",
    desc: "Estamos preparando tu pedido con cuidado.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    key: "empaquetando",
    label: "Empaquetando",
    desc: "Tu pedido está siendo embalado para el envío.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12m9-5-9 5-9-5m0 0 9-5 9 5"/><path d="M3 17l9 5 9-5"/>
      </svg>
    ),
  },
  {
    key: "listo_envio",
    label: "Listo para envío",
    desc: "Tu pedido está listo y a la espera del transportista.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    key: "enviado",
    label: "En camino",
    desc: "Tu pedido está en ruta. Pronto llegará a tu puerta.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14m-7-7 7 7-7 7"/>
      </svg>
    ),
  },
  {
    key: "completado",
    label: "Entregado",
    desc: "¡Pedido entregado! Esperamos que lo disfrutes.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
      </svg>
    ),
  },
]

const STATUS_INDEX = STEPS.reduce((acc, s, i) => { acc[s.key] = i; return acc }, {})

/* ================= FORMATTERS ================= */
const money = (v) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v ?? 0)

const fdate = (d) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })

/* ================= API ================= */
async function fetchOrder(orderId) {
  // TODO: conectar con backend cuando esté listo
  // const res = await fetch(`/api/orders/track/${orderId}`)
  // return res.json()

  // Mock data para desarrollo
  await new Promise((r) => setTimeout(r, 900))
  if (orderId === "99999") return null
  return {
    id: orderId,
    full_name: "María García",
    email: "m.garcia@email.com",
    status: "en_preparacion",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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

/* ================= PRODUCT ICON ================= */
function ProductIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
    </svg>
  )
}

/* ================= SEARCH FORM ================= */
function SearchForm({ onSearch, loading }) {
  const [value, setValue] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    const v = value.trim()
    if (v) onSearch(v)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Número de pedido (ej: 1234)"
            className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-12 px-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          {loading
            ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          }
          Consultar
        </button>
      </form>
      <p className="text-center text-xs text-slate-400 mt-3">
        Encontrarás el número de pedido en el email de confirmación.
      </p>
    </div>
  )
}

/* ================= PROGRESS STEPPER ================= */
function ProgressStepper({ currentStatus }) {
  const currentIdx = STATUS_INDEX[currentStatus] ?? 0
  const isCompleted = currentStatus === "completado"

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100" style={{ zIndex: 0 }} />
      <div
        className="absolute top-5 left-5 h-0.5 bg-orange-400 transition-all duration-700"
        style={{
          zIndex: 1,
          width: currentIdx === 0 ? "0%" : `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - 0px)`,
        }}
      />

      <div className="relative flex justify-between" style={{ zIndex: 2 }}>
        {STEPS.map((step, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          const pending = i > currentIdx

          return (
            <div key={step.key} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                done
                  ? "bg-orange-500 border-orange-500 text-white"
                  : active
                    ? isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "bg-orange-500 border-orange-500 text-white shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                    : "bg-white border-slate-200 text-slate-300"
              }`}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 11 3 3L22 4"/>
                  </svg>
                ) : (
                  <span className={active ? "text-white" : "text-slate-300"}>{step.icon}</span>
                )}
              </div>

              {/* Label */}
              <div className="text-center px-1">
                <p className={`text-[11px] font-semibold leading-tight ${
                  active ? (isCompleted ? "text-emerald-600" : "text-orange-600")
                  : done ? "text-slate-500"
                  : "text-slate-300"
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= TIMELINE ================= */
function Timeline({ events, currentStatus }) {
  const currentStep = STEPS.find(s => s.key === currentStatus)

  return (
    <div className="flex flex-col gap-0">
      {events.map((ev, i) => {
        const step = STEPS.find(s => s.key === ev.status)
        const isLast = i === events.length - 1
        return (
          <div key={i} className="flex gap-4">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${isLast ? "bg-orange-500" : "bg-slate-300"}`} />
              {i < events.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" style={{ minHeight: 32 }} />}
            </div>
            {/* Content */}
            <div className={`pb-5 ${i === events.length - 1 ? "pb-0" : ""}`}>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{step?.label ?? ev.status}</p>
              {ev.note && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{ev.note}</p>}
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date(ev.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )
      })}

      {/* Pending future steps */}
      {currentStatus !== "completado" && (
        <div className="flex gap-4 mt-1">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full mt-1 bg-slate-100 border border-slate-200 flex-shrink-0" />
          </div>
          <div>
            <p className="text-sm text-slate-300 font-medium">{
              STEPS[Math.min(STATUS_INDEX[currentStatus] + 1, STEPS.length - 1)]?.label
            }</p>
            <p className="text-xs text-slate-300 mt-0.5">Próxima actualización</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= ORDER RESULT ================= */
function OrderResult({ order, onReset }) {
  const currentIdx = STATUS_INDEX[order.status] ?? 0
  const isCompleted = order.status === "completado"
  const currentStep = STEPS.find(s => s.key === order.status)
  const totalItems = order.items?.reduce((a, i) => a + i.quantity, 0) ?? 0

  return (
    <div className="flex flex-col gap-6">

      {/* Status hero card */}
      <div className={`rounded-2xl p-6 border ${isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pedido #{order.id}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{fdate(order.created_at)}</span>
            </div>
            <h2 className={`text-2xl font-extrabold tracking-tight ${isCompleted ? "text-emerald-700" : "text-orange-600"}`}>
              {currentStep?.label}
            </h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-sm">
              {currentStep?.desc}
            </p>
          </div>

          {/* Icon circle */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-500"}`}>
            {currentStep?.icon && <span style={{ transform: "scale(1.4)" }}>{currentStep.icon}</span>}
          </div>
        </div>

        {/* Stepper */}
        <ProgressStepper currentStatus={order.status} />
      </div>

      {/* Two columns: products + timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Products */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Productos ({totalItems} {totalItems === 1 ? "unidad" : "unidades"})
            </p>
            <span className="text-sm font-bold text-slate-800">{money(order.total_amount)}</span>
          </div>

          <div className="flex flex-col gap-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 bg-white rounded-lg border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <ProductIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{item.product_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-700">{money(item.unit_price * item.quantity)}</p>
                  <p className="text-[11px] text-slate-400">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">Total del pedido</span>
            <span className="text-base font-extrabold text-slate-900">{money(order.total_amount)}</span>
          </div>
        </div>

        {/* Right col: timeline + shipping */}
        <div className="flex flex-col gap-4">

          {/* Timeline */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historial</p>
            <Timeline events={order.timeline} currentStatus={order.status} />
          </div>

          {/* Shipping address */}
          {(order.address || order.city) && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dirección de entrega</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{[order.city, order.country].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">¿Tienes alguna pregunta?</p>
            <p className="text-xs text-slate-400 mt-0.5">Nuestro equipo está disponible para ayudarte.</p>
          </div>
        </div>
        <a
          href="mailto:info@tienda.com"
          className="flex-shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          Contactar
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </a>
      </div>

      {/* Search another */}
      <button
        onClick={onReset}
        className="text-sm text-slate-400 hover:text-orange-500 transition-colors text-center flex items-center justify-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5m7-7-7 7 7 7"/>
        </svg>
        Consultar otro pedido
      </button>
    </div>
  )
}

/* ================= MAIN ================= */
export default function OrderTracking() {
  const [phase, setPhase] = useState("idle") // idle | loading | found | not_found | error
  const [order, setOrder] = useState(null)
  const [queriedId, setQueriedId] = useState(null)

  async function handleSearch(orderId) {
    setPhase("loading")
    setQueriedId(orderId)
    try {
      const result = await fetchOrder(orderId)
      if (!result) {
        setPhase("not_found")
      } else {
        setOrder(result)
        setPhase("found")
      }
    } catch (e) {
      setPhase("error")
    }
  }

  function handleReset() {
    setPhase("idle")
    setOrder(null)
    setQueriedId(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Seguimiento de pedido</h1>
        <p className="text-slate-400 text-sm mt-0.5">Consulta el estado de tu pedido en tiempo real.</p>
      </div>

      {/* IDLE / LOADING — search form */}
      {(phase === "idle" || phase === "loading") && (
        <div className="max-w-2xl">
          {/* Hero */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 mb-1">¿Dónde está mi pedido?</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Introduce tu número de pedido para ver el estado actualizado al momento.
            </p>
            <SearchForm onSearch={handleSearch} loading={phase === "loading"} />
          </div>

          {/* Steps preview */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Proceso de envío</p>
            <div className="grid grid-cols-3 gap-3">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 text-orange-400">
                    <span style={{ transform: "scale(0.85)" }}>{step.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{step.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NOT FOUND */}
      {phase === "not_found" && (
        <div className="max-w-md">
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center mb-6">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-2">Pedido no encontrado</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-1">
              No hemos encontrado ningún pedido con el número <strong className="text-slate-700">#{queriedId}</strong>.
            </p>
            <p className="text-xs text-slate-400">Revisa que el número sea correcto o consulta tu email de confirmación.</p>
          </div>
          <SearchForm onSearch={handleSearch} loading={false} />
          <button onClick={handleReset} className="w-full mt-4 text-sm text-slate-400 hover:text-orange-500 transition-colors text-center">
            ← Volver
          </button>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div className="max-w-md">
          <div className="bg-white border border-orange-100 rounded-2xl p-8 text-center mb-6">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4m0 4h.01"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-2">Error de conexión</h2>
            <p className="text-sm text-slate-500 leading-relaxed">No hemos podido consultar el estado. Inténtalo de nuevo en unos instantes.</p>
          </div>
          <button
            onClick={() => handleSearch(queriedId)}
            className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all mb-3"
          >
            Reintentar
          </button>
          <button onClick={handleReset} className="w-full text-sm text-slate-400 hover:text-orange-500 transition-colors text-center">
            ← Volver
          </button>
        </div>
      )}

      {/* FOUND */}
      {phase === "found" && order && (
        <OrderResult order={order} onReset={handleReset} />
      )}
    </div>
  )
}
