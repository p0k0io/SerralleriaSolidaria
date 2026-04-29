import { useEffect, useMemo, useRef, useState, useCallback } from "react";

/* ================= CONFIG ================= */
const API_BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("token") || "";

/* ================= STATUS ================= */
const STATUS = {
  nuevo:          { label: "Nuevo",             dot: "#6366f1", badge: { bg: "#eef2ff", color: "#4338ca" }, header: { border: "#c7d2fe", bg: "#f5f3ff" } },
  en_preparacion: { label: "En preparación",    dot: "#f59e0b", badge: { bg: "#fffbeb", color: "#92400e" }, header: { border: "#fde68a", bg: "#fefce8" } },
  empaquetando:   { label: "Empaquetando",      dot: "#a855f7", badge: { bg: "#faf5ff", color: "#6b21a8" }, header: { border: "#e9d5ff", bg: "#faf5ff" } },
  listo_envio:    { label: "Listo para envío",  dot: "#06b6d4", badge: { bg: "#ecfeff", color: "#0e7490" }, header: { border: "#a5f3fc", bg: "#ecfeff" } },
  enviado:        { label: "Enviado",            dot: "#f97316", badge: { bg: "#fff7ed", color: "#9a3412" }, header: { border: "#fed7aa", bg: "#fff7ed" } },
  completado:     { label: "Completado",         dot: "#10b981", badge: { bg: "#ecfdf5", color: "#065f46" }, header: { border: "#a7f3d0", bg: "#f0fdf4" } },
  cancelado:      { label: "Cancelado",          dot: "#ef4444", badge: { bg: "#fef2f2", color: "#991b1b" }, header: { border: "#fecaca", bg: "#fef2f2" } },
};

const STATUS_ORDER = ["nuevo","en_preparacion","empaquetando","listo_envio","enviado","completado","cancelado"];

const STATUS_FLOW = {
  nuevo:          { next: "en_preparacion", label: "Iniciar preparación", color: "#f59e0b", hov: "#d97706" },
  en_preparacion: { next: "empaquetando",   label: "Empaquetar pedido",   color: "#a855f7", hov: "#9333ea" },
  empaquetando:   { next: "listo_envio",    label: "Listo para envío",    color: "#06b6d4", hov: "#0891b2" },
  listo_envio:    { next: "enviado",        label: "Marcar enviado",      color: "#f97316", hov: "#ea580c" },
  enviado:        { next: "completado",     label: "Confirmar entrega",   color: "#10b981", hov: "#059669" },
};

/* ================= FORMATTERS ================= */
const money = (v) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v ?? 0);
const fdate = (d) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
const fdateShort = (d) =>
  new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

/* ================= API ================= */
const api = {
  async getAll() {
    const r = await fetch(`${API_BASE}/admin/orders`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
  async update(id, status) {
    const r = await fetch(`${API_BASE}/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
  async destroy(id) {
    const r = await fetch(`${API_BASE}/admin/orders/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
};

/* ================= TOAST ================= */
function Toast({ msg, type, onHide }) {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); }, [onHide]);
  const isErr = type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 100,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 12,
      background: isErr ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${isErr ? "#fecaca" : "#bbf7d0"}`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      animation: "slideUp 0.2s ease",
      maxWidth: 320,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
        background: isErr ? "#ef4444" : "#10b981",
      }} />
      <span style={{ fontSize: 13, color: isErr ? "#dc2626" : "#047857", fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

/* ================= INITIALS AVATAR ================= */
function InitialsAvatar({ name, size = "sm" }) {
  const parts = (name || "?").trim().split(" ");
  const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  const palettes = [
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#dbeafe", text: "#1e40af" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fef3c7", text: "#92400e" },
    { bg: "#ffe4e6", text: "#9f1239" },
    { bg: "#ecfeff", text: "#0e7490" },
  ];
  const p = palettes[(name || "?").charCodeAt(0) % palettes.length];
  const dim = size === "lg" ? 52 : size === "md" ? 38 : 32;
  const fs  = size === "lg" ? 17 : size === "md" ? 14 : 12;
  return (
    <div style={{
      width: dim, height: dim, borderRadius: "50%",
      background: p.bg, color: p.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 700, flexShrink: 0,
      textTransform: "uppercase", letterSpacing: "0.03em",
      border: `2px solid ${p.text}22`,
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

/* ================= ORDER CARD ================= */
function OrderCard({ order, isDragging, onDragStart, onDragEnd, onOpen }) {
  const s = STATUS[order.status] || STATUS.nuevo;
  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(order.id); }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(order.id)}
      style={{
        background: "#fff",
        border: "1px solid #e8edf2",
        borderRadius: 14, padding: "12px 14px",
        cursor: "grab",
        transition: "box-shadow 0.18s, border-color 0.18s, opacity 0.18s, transform 0.18s",
        userSelect: "none",
        opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? "scale(0.97)" : "scale(1)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#d1d9e0";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#e8edf2";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <InitialsAvatar name={order.full_name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {order.full_name || "Sin nombre"}
            </p>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#b0bec5", flexShrink: 0, letterSpacing: "0.02em" }}>
              #{order.id}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{money(order.total_amount)}</span>
            <span style={{ fontSize: 10, color: "#dde1e7" }}>·</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{order.created_at ? fdateShort(order.created_at) : "—"}</span>
            {Array.isArray(order.items) && order.items.length > 0 && (
              <>
                <span style={{ fontSize: 10, color: "#dde1e7" }}>·</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {order.items.reduce((a, i) => a + (i.quantity || 0), 0)} uds.
                </span>
              </>
            )}
          </div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${s.dot}30` }} />
      </div>
    </div>
  );
}

/* ================= ACTION BUTTON ================= */
function ActionBtn({ label, bg, hov, onClick, outline, outlineColor, disabled, icon }) {
  const [hover, setHover] = useState(false);
  const base = {
    width: "100%", padding: "10px 0", borderRadius: 10,
    fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s", fontFamily: "inherit",
    opacity: disabled ? 0.5 : 1, display: "flex",
    alignItems: "center", justifyContent: "center", gap: 6,
  };
  if (outline) return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, fontWeight: 500, background: hover ? `${outlineColor}12` : "transparent", border: `1.5px solid ${outlineColor}50`, color: outlineColor }}>
      {icon && icon}{label}
    </button>
  );
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, fontWeight: 600, background: hover ? hov : bg, color: "#fff", border: "none", boxShadow: hover ? `0 4px 12px ${bg}60` : "none" }}>
      {icon && icon}{label}
    </button>
  );
}

/* ================= MODAL ================= */
function OrderModal({ order, onClose, onStatusChange, onDelete, loading }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmCancel(false);
    setConfirmDelete(false);
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [order?.id, onClose]);

  if (!order) return null;

  const s           = STATUS[order.status] || STATUS.nuevo;
  const flow        = STATUS_FLOW[order.status] || null;
  const isCompleted = order.status === "completado";
  const isCancelled = order.status === "cancelado";
  const currentIdx  = STATUS_ORDER.indexOf(order.status);

  // Normalize items defensively
  const items = Array.isArray(order.items) ? order.items : [];
  const totalItems = items.reduce((a, i) => a + (Number(i.quantity) || 0), 0);

  // Progress steps (exclude cancelado from normal flow)
  const flowSteps = STATUS_ORDER.filter(s => s !== "cancelado");
  const flowIdx   = flowSteps.indexOf(order.status);
  const progressPct = flowIdx >= 0 ? Math.round((flowIdx / (flowSteps.length - 1)) * 100) : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px",
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)",
      }} />

      {/* Modal */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 860,
        background: "#fff", borderRadius: 22,
        boxShadow: "0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column",
        overflow: "hidden", maxHeight: "92vh",
      }}>

        {/* ── HEADER ── */}
        <div style={{ padding: "28px 32px 0", borderBottom: "1px solid #f1f5f9" }}>

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            <InitialsAvatar name={order.full_name} size="lg" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
                  {order.full_name || "Sin nombre"}
                </h2>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Pedido #{order.id}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                  background: s.badge.bg, color: s.badge.color,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                  {s.label}
                </span>
              </div>

              {/* Contact info */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {order.email && (
                  <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    {order.email}
                  </span>
                )}
                {order.phone && (
                  <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 9.02a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1h3.12a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16z"/></svg>
                    {order.phone}
                  </span>
                )}
                {order.created_at && (
                  <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {fdate(order.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Close */}
            <button onClick={onClose} style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 8, cursor: "pointer", color: "#94a3b8",
              padding: "6px", display: "flex", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#94a3b8"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Progress bar — solo si no está cancelado */}
          {!isCancelled && (
            <div style={{ paddingBottom: 22 }}>
              <div style={{ position: "relative" }}>
                {/* Track */}
                <div style={{ height: 3, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    background: `linear-gradient(90deg, ${s.dot}, ${s.dot}bb)`,
                    width: `${progressPct}%`,
                    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
                {/* Steps */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {flowSteps.map((st, i) => {
                    const active = i === flowIdx;
                    const done = i < flowIdx;
                    return (
                      <div key={st} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: done ? s.dot : active ? s.dot : "#e2e8f0",
                          border: `2px solid ${done || active ? s.dot : "#e2e8f0"}`,
                          transform: active ? "scale(1.4)" : "scale(1)",
                          transition: "all 0.3s",
                        }} />
                        <span style={{
                          fontSize: 9, fontWeight: active ? 700 : 400,
                          color: active ? s.dot : done ? "#94a3b8" : "#cbd5e1",
                          whiteSpace: "nowrap",
                        }}>
                          {STATUS[st].label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div style={{ paddingBottom: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "#fef2f2", border: "1px solid #fecaca" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Este pedido fue cancelado</span>
              </div>
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT ── */}
          <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 28 }}>

            {/* PRODUCTS */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                    <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Productos · {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{money(order.total_amount)}</span>
              </div>

              {items.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.map((item, idx) => (
                    <div key={item.id ?? idx} style={{
                      display: "flex", alignItems: "center",
                      padding: "12px 14px", borderRadius: 12,
                      background: "#f8fafc", border: "1px solid #f1f5f9",
                      gap: 12,
                    }}>
                      {/* Product icon */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "#fff", border: "1px solid #e8edf2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                          <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
                        </svg>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.product_name || "Producto sin nombre"}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                          {item.quantity} × {money(item.unit_price)}
                        </p>
                      </div>

                      {/* Qty badge */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 8,
                        background: "#e8edf2", flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{item.quantity}</span>
                      </div>

                      {/* Subtotal */}
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", flexShrink: 0, minWidth: 60, textAlign: "right" }}>
                        {money((item.quantity || 0) * (item.unit_price || 0))}
                      </span>
                    </div>
                  ))}

                  {/* Total row */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", marginTop: 2,
                    borderTop: "2px dashed #f1f5f9",
                  }}>
                    <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Total del pedido</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{money(order.total_amount)}</span>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "32px 0", background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0",
                  gap: 8,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                  </svg>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Sin productos registrados</p>
                  <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>Comprueba que el backend envía el campo "items"</p>
                </div>
              )}
            </section>

            {/* SHIPPING */}
            {(order.address || order.city) && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Dirección de envío
                  </span>
                </div>
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  border: "1px solid #f1f5f9", background: "#f8fafc",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#dbeafe", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {order.address && <p style={{ fontSize: 13, color: "#334155", margin: 0, fontWeight: 500 }}>{order.address}</p>}
                    {order.postal_code && <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>CP {order.postal_code}</p>}
                    {(order.city || order.country) && (
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                        {[order.city, order.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PAYMENT */}
            {order.payment && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Información de pago
                  </span>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }}>
                  <MetaRow label="Proveedor" value={order.payment.provider || "—"} />
                  <MetaRow label="Estado" value={order.payment.payment_status || "—"} bold />
                  {order.payment.transaction_id && (
                    <MetaRow
                      label="Transacción"
                      value={<span style={{ fontFamily: "monospace", fontSize: 11, color: "#475569" }}>···{order.payment.transaction_id.slice(-14)}</span>}
                    />
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT: ACTIONS ── */}
          <div style={{
            width: 230, borderLeft: "1px solid #f1f5f9",
            background: "#fafbfc", padding: "28px 20px",
            display: "flex", flexDirection: "column", gap: 10,
            flexShrink: 0, overflowY: "auto",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>
              Acciones
            </p>

            {isCancelled ? (
              <div style={{ padding: "14px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", textAlign: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ marginBottom: 6 }}>
                  <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", margin: 0 }}>Pedido cancelado</p>
              </div>
            ) : isCompleted ? (
              <div style={{ padding: "16px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ marginBottom: 8 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
                </svg>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#047857", margin: 0 }}>Pedido completado</p>
                <p style={{ fontSize: 11, color: "#6ee7b7", margin: "4px 0 0" }}>Entrega confirmada</p>
              </div>
            ) : (
              <>
                {flow && (
                  <ActionBtn
                    label={flow.label}
                    bg={flow.color}
                    hov={flow.hov}
                    disabled={loading}
                    onClick={() => onStatusChange(order.id, flow.next)}
                  />
                )}

                {["nuevo", "en_preparacion", "empaquetando"].includes(order.status) && (
                  confirmCancel ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: 12 }}>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>¿Cancelar este pedido?</p>
                      <ActionBtn label="Sí, cancelar" bg="#ef4444" hov="#dc2626" disabled={loading}
                        onClick={() => { onStatusChange(order.id, "cancelado"); setConfirmCancel(false); onClose(); }} />
                      <button onClick={() => setConfirmCancel(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: "4px 0", fontFamily: "inherit" }}>
                        Volver
                      </button>
                    </div>
                  ) : (
                    <ActionBtn outline outlineColor="#ef4444" label="Cancelar pedido" onClick={() => setConfirmCancel(true)} />
                  )
                )}
              </>
            )}

            {/* Delete */}
            <div style={{ marginTop: 4 }}>
              {confirmDelete ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: 12 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>Esta acción es permanente. ¿Confirmar?</p>
                  <ActionBtn label="Eliminar definitivamente" bg="#1e293b" hov="#0f172a" disabled={loading} onClick={() => onDelete(order.id)} />
                  <button onClick={() => setConfirmDelete(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: "4px 0", fontFamily: "inherit" }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <ActionBtn outline outlineColor="#94a3b8" label="Eliminar pedido" onClick={() => setConfirmDelete(true)} />
              )}
            </div>

            {/* Meta */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }}>
              <MetaRow label="ID pedido" value={`#${order.id}`} />
              {order.created_at && <MetaRow label="Fecha" value={fdateShort(order.created_at)} />}
              {order.total_amount != null && <MetaRow label="Total" value={money(order.total_amount)} bold />}
              <MetaRow label="Líneas" value={items.length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 11, color: "#334155", fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

/* ================= COLUMN ================= */
function Column({ status, orders, draggingId, onDragOver, onDrop, onDragStart, onDragEnd, onOpen }) {
  const s = STATUS[status];
  const [isOver, setIsOver] = useState(false);
  const colRevenue = orders.reduce((a, o) => a + (o.total_amount ?? 0), 0);
  const isDraggingHere = draggingId != null && orders.some(o => o.id === draggingId);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
    onDragOver(status);
  };

  return (
    <div style={{ minWidth: 236, maxWidth: 236, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Column header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 13px", borderRadius: 11,
        background: s.header.bg,
        border: `1px solid ${s.header.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${s.dot}30` }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{s.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {orders.length > 0 && (
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{money(colRevenue)}</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, color: s.badge.color,
            background: s.badge.bg,
            borderRadius: 99, padding: "2px 8px",
            minWidth: 22, textAlign: "center",
          }}>
            {orders.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsOver(false)}
        onDrop={() => { setIsOver(false); onDrop(status); }}
        style={{
          display: "flex", flexDirection: "column", gap: 8,
          padding: 8, borderRadius: 14, minHeight: 140, flex: 1,
          border: `2px dashed ${isOver ? s.dot : "#e2e8f0"}`,
          background: isOver ? `${s.dot}0d` : "#f8fafc",
          transition: "all 0.15s cubic-bezier(0.4,0,0.2,1)",
          outline: isOver ? `3px solid ${s.dot}30` : "3px solid transparent",
          outlineOffset: 2,
        }}
      >
        {orders.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0" }}>
            <p style={{ fontSize: 11, color: isOver ? s.dot : "#cbd5e1", margin: 0, fontWeight: isOver ? 600 : 400, transition: "all 0.15s" }}>
              {isOver ? "Soltar aquí" : "Sin pedidos"}
            </p>
          </div>
        )}
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            isDragging={draggingId === o.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onOpen={onOpen}
          />
        ))}
        {/* Ghost drop indicator when dragging over non-empty column */}
        {isOver && orders.length > 0 && (
          <div style={{
            height: 4, borderRadius: 99,
            background: s.dot, opacity: 0.5,
            margin: "2px 4px",
          }} />
        )}
      </div>
    </div>
  );
}

/* ================= BOARD ================= */
export default function OrdersBoard() {
  const [orders, setOrders]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch]       = useState("");
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [fetchError, setFetchError] = useState(false);
  const [toast, setToast]         = useState(null);

  // Drag state: id being dragged + column currently hovered
  const [draggingId, setDraggingId]     = useState(null);
  const [dragOverCol, setDragOverCol]   = useState(null);
  const dragOriginStatus                = useRef(null);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const loadOrders = useCallback(() => {
    setFetchError(false);
    api.getAll()
      .then(setOrders)
      .catch(() => setFetchError(true));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  /* ---- Update status (optimistic) ---- */
  const updateStatus = useCallback(async (id, newStatus) => {
    const backup = [...orders];
    // Optimistic update — mueve la tarjeta inmediatamente en UI
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setLoadingIds(s => new Set(s).add(id));
    try {
      await api.update(id, newStatus);
      showToast(`Pedido #${id} → ${STATUS[newStatus]?.label || newStatus}`);
    } catch {
      // Rollback si falla
      setOrders(backup);
      showToast(`Error al actualizar el pedido #${id}`, "error");
    } finally {
      setLoadingIds(s => { const n = new Set(s); n.delete(id); return n; });
    }
  }, [orders, showToast]);

  /* ---- Delete ---- */
  const deleteOrder = useCallback(async (id) => {
    const backup = [...orders];
    setOrders(prev => prev.filter(o => o.id !== id));
    setSelectedId(null);
    try {
      await api.destroy(id);
      showToast(`Pedido #${id} eliminado`);
    } catch {
      setOrders(backup);
      showToast(`Error al eliminar el pedido #${id}`, "error");
    }
  }, [orders, showToast]);

  /* ---- Drag handlers ---- */
  const handleDragStart = useCallback((id) => {
    const order = orders.find(o => o.id === id);
    setDraggingId(id);
    dragOriginStatus.current = order?.status || null;
  }, [orders]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverCol(null);
    dragOriginStatus.current = null;
  }, []);

  const handleDragOver = useCallback((colStatus) => {
    setDragOverCol(colStatus);
  }, []);

  const handleDrop = useCallback((targetStatus) => {
    const id = draggingId;
    setDraggingId(null);
    setDragOverCol(null);
    if (!id) return;
    const order = orders.find(o => o.id === id);
    if (order && order.status !== targetStatus) {
      updateStatus(id, targetStatus);
    }
    dragOriginStatus.current = null;
  }, [draggingId, orders, updateStatus]);

  /* ---- Filtered & grouped ---- */
  const filtered = useMemo(() =>
    orders.filter(o =>
      !search ||
      (o.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
    ), [orders, search]);

  const grouped = useMemo(() =>
    STATUS_ORDER.reduce((acc, s) => {
      acc[s] = filtered.filter(o => o.status === s);
      return acc;
    }, {}), [filtered]);

  const selectedOrder = selectedId != null ? orders.find(o => o.id === selectedId) ?? null : null;

  const totalRevenue = orders.filter(o => o.status !== "cancelado").reduce((a, o) => a + (o.total_amount ?? 0), 0);
  const completados  = orders.filter(o => o.status === "completado").length;
  const enCurso      = orders.filter(o => !["completado", "cancelado", "nuevo"].includes(o.status)).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eaecf0", padding: "18px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
              Panel de pedidos
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>Gestión logística · Vista Kanban</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b0bec5" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nombre, email o nº pedido…"
                style={{
                  paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                  fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10,
                  background: "#f8fafc", outline: "none", width: 230,
                  color: "#374151", fontFamily: "inherit", transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Refresh */}
            <button onClick={loadOrders}
              style={{
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff",
                cursor: "pointer", color: "#94a3b8", transition: "all 0.15s",
              }}
              title="Recargar pedidos"
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8"; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v4h-4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { label: "Total pedidos", value: orders.length,      color: "#334155" },
            { label: "Facturación",   value: money(totalRevenue), color: "#6366f1" },
            { label: "En curso",      value: enCurso,             color: "#f59e0b" },
            { label: "Completados",   value: completados,         color: "#059669" },
          ].map((stat, i) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 24, background: "#f1f5f9", margin: "0 20px" }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: stat.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{stat.value}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ERROR ── */}
      {fetchError && (
        <div style={{
          margin: "16px 28px 0", padding: "12px 16px", borderRadius: 12,
          background: "#fef2f2", border: "1px solid #fecaca",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          <span style={{ fontSize: 13, color: "#dc2626", flex: 1 }}>
            No se pudieron cargar los pedidos. Revisa que el servidor esté activo y el token sea válido.
          </span>
          <button onClick={loadOrders} style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7,
            cursor: "pointer", fontSize: 12, color: "#dc2626", padding: "4px 10px", fontFamily: "inherit",
          }}>Reintentar</button>
        </div>
      )}

      {/* ── BOARD ── */}
      <div style={{ padding: "24px 28px", overflowX: "auto" }}>
        {orders.length === 0 && !fetchError ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", margin: "0 0 4px" }}>Cargando pedidos…</p>
              <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>Conectando con el servidor</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 14, minWidth: "max-content", alignItems: "flex-start" }}>
            {STATUS_ORDER.map(status => (
              <Column
                key={status}
                status={status}
                orders={grouped[status]}
                draggingId={draggingId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onOpen={id => setSelectedId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedId(null)}
        loading={selectedOrder ? loadingIds.has(selectedOrder.id) : false}
        onStatusChange={(id, status) => {
          updateStatus(id, status);
          setSelectedId(null);
        }}
        onDelete={deleteOrder}
      />

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onHide={hideToast} />}
    </div>
  );
}