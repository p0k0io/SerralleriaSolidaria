import { useEffect, useMemo, useRef, useState } from "react";

/* ================= STATUS ================= */
const STATUS = {
  nuevo: {
    label: "Nuevo",
    dot: "#6366f1",
    badge: { bg: "#eef2ff", color: "#4f46e5" },
    header: { border: "#c7d2fe" },
    dragOver: { border: "#6366f1", bg: "#eef2ff99" },
  },
  en_preparacion: {
    label: "En preparación",
    dot: "#f59e0b",
    badge: { bg: "#fffbeb", color: "#b45309" },
    header: { border: "#fde68a" },
    dragOver: { border: "#f59e0b", bg: "#fffbeb99" },
  },
  empaquetando: {
    label: "Empaquetando",
    dot: "#a855f7",
    badge: { bg: "#faf5ff", color: "#7e22ce" },
    header: { border: "#e9d5ff" },
    dragOver: { border: "#a855f7", bg: "#faf5ff99" },
  },
  listo_envio: {
    label: "Listo para envío",
    dot: "#06b6d4",
    badge: { bg: "#ecfeff", color: "#0e7490" },
    header: { border: "#a5f3fc" },
    dragOver: { border: "#06b6d4", bg: "#ecfeff99" },
  },
  enviado: {
    label: "Enviado",
    dot: "#f97316",
    badge: { bg: "#fff7ed", color: "#c2410c" },
    header: { border: "#fed7aa" },
    dragOver: { border: "#f97316", bg: "#fff7ed99" },
  },
  completado: {
    label: "Completado",
    dot: "#10b981",
    badge: { bg: "#ecfdf5", color: "#047857" },
    header: { border: "#a7f3d0" },
    dragOver: { border: "#10b981", bg: "#ecfdf599" },
  },
};

const STATUS_ORDER = [
  "nuevo", "en_preparacion", "empaquetando",
  "listo_envio", "enviado", "completado",
];

const STATUS_FLOW = {
  nuevo:          { next: "en_preparacion", label: "Iniciar preparación", color: "#f59e0b", hov: "#d97706" },
  en_preparacion: { next: "empaquetando",   label: "Empaquetar pedido",   color: "#a855f7", hov: "#9333ea" },
  empaquetando:   { next: "listo_envio",    label: "Listo para envío",    color: "#06b6d4", hov: "#0891b2" },
  listo_envio:    { next: "enviado",        label: "Marcar enviado",       color: "#f97316", hov: "#ea580c" },
  enviado:        { next: "completado",     label: "Confirmar entrega",    color: "#10b981", hov: "#059669" },
};

const PRIORITY = {
  alta:   { label: "Alta",   color: "#ef4444", bg: "#fef2f2" },
  media:  { label: "Media",  color: "#f59e0b", bg: "#fffbeb" },
  baja:   { label: "Baja",   color: "#10b981", bg: "#ecfdf5" },
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
    const r = await fetch("/api/admin/orders");
    return r.json();
  },
  async update(id, status) {
    return fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
};

/* ================= INITIALS AVATAR ================= */
function InitialsAvatar({ name, size = "sm" }) {
  const parts = (name || "?").trim().split(" ");
  const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  const palettes = [
    { bg: "#ede9fe", text: "#6d28d9" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#047857" },
    { bg: "#fef3c7", text: "#b45309" },
    { bg: "#ffe4e6", text: "#be123c" },
    { bg: "#ecfeff", text: "#0e7490" },
  ];
  const p = palettes[(name || "").charCodeAt(0) % palettes.length];
  const dim = size === "lg" ? 48 : size === "md" ? 36 : 30;
  const fs = size === "lg" ? 16 : size === "md" ? 13 : 11;
  return (
    <div style={{
      width: dim, height: dim, borderRadius: "50%",
      background: p.bg, color: p.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 700, flexShrink: 0,
      textTransform: "uppercase", letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}

/* ================= PRIORITY BADGE ================= */
function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.media;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 7px",
      borderRadius: 99, background: p.bg, color: p.color,
    }}>
      {p.label}
    </span>
  );
}

/* ================= ORDER CARD (minimal) ================= */
function OrderCard({ order, onDragStart, onOpen }) {
  const s = STATUS[order.status];
  const isUrgent = order.priority === "alta";

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(order.id); }}
      onClick={() => onOpen(order.id)}
      style={{
        background: "#fff",
        border: `1px solid ${isUrgent ? "#fecaca" : "#f1f5f9"}`,
        borderRadius: 12,
        padding: "10px 12px",
        cursor: "grab",
        transition: "box-shadow 0.15s, border-color 0.15s",
        userSelect: "none",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isUrgent ? "#fca5a5" : "#e2e8f0";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isUrgent ? "#fecaca" : "#f1f5f9";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Urgent strip */}
      {isUrgent && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3, background: "#ef4444", borderRadius: "12px 0 0 12px",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: isUrgent ? 6 : 0 }}>
        <InitialsAvatar name={order.full_name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {order.full_name}
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", flexShrink: 0 }}>
              #{order.id}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{money(order.total_amount)}</span>
            <span style={{ fontSize: 10, color: "#cbd5e1" }}>·</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{fdateShort(order.created_at)}</span>
          </div>
        </div>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      </div>
    </div>
  );
}

/* ================= ACTION BUTTON ================= */
function ActionBtn({ label, bg, hov, onClick, outline, outlineColor, textColor }) {
  const [hover, setHover] = useState(false);
  if (outline) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: "100%", padding: "9px 0", borderRadius: 10,
          fontSize: 13, fontWeight: 500, cursor: "pointer",
          background: hover ? `${outlineColor}10` : "none",
          border: `1px solid ${outlineColor}60`,
          color: textColor || outlineColor,
          transition: "background 0.15s", fontFamily: "inherit",
        }}
      >{label}</button>
    );
  }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", padding: "10px 0", borderRadius: 10,
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        background: hover ? hov : bg,
        color: "#fff", border: "none",
        transition: "background 0.15s", fontFamily: "inherit",
      }}
    >{label}</button>
  );
}

/* ================= MODAL ================= */
function OrderModal({ order, onClose, onStatusChange }) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    setConfirmCancel(false);
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [order?.id, onClose]);

  if (!order) return null;

  const s = STATUS[order.status];
  const flow = STATUS_FLOW[order.status] || null;
  const isCompleted = order.status === "completado";
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const progressPct = Math.round((currentIdx / (STATUS_ORDER.length - 1)) * 100);

  const totalItems = order.items?.reduce((a, i) => a + i.quantity, 0) ?? 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      }} />

      <div style={{
        position: "relative", width: "100%", maxWidth: 820,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
        overflow: "hidden", maxHeight: "92vh",
        border: "1px solid #f1f5f9",
      }}>

        {/* ── HEADER ── */}
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #f8fafc" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <InitialsAvatar name={order.full_name} size="lg" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  {order.full_name}
                </h2>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Pedido #{order.id}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                  background: s.badge.bg, color: s.badge.color,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                  {s.label}
                </span>
                {order.priority && <PriorityBadge priority={order.priority} />}
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 6, flexWrap: "wrap" }}>
                {order.email && (
                  <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    {order.email}
                  </span>
                )}
                {order.created_at && (
                  <span style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {fdate(order.created_at)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 4, borderRadius: 8, display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#475569"}
              onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Progress */}
          <div style={{ paddingBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Progreso del pedido</span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{progressPct}%</span>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: s.dot,
                width: `${progressPct}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {STATUS_ORDER.map((st, i) => (
                <div key={st} style={{
                  fontSize: 9, color: i <= currentIdx ? s.dot : "#cbd5e1",
                  fontWeight: i === currentIdx ? 700 : 400,
                  textAlign: "center", flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {STATUS[st].label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* LEFT: productos + dirección */}
          <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Products */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                  Productos ({totalItems} {totalItems === 1 ? "unidad" : "unidades"})
                </p>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{money(order.total_amount)}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10,
                    background: "#f8fafc", border: "1px solid #f1f5f9",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "#e2e8f0", display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                          <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                          {item.product_name}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                          {item.quantity} × {money(item.unit_price)}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                      {money(item.quantity * item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total row */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 12px 0", marginTop: 4,
                borderTop: "1px solid #f1f5f9",
              }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Total del pedido</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{money(order.total_amount)}</span>
              </div>
            </div>

            {/* Shipping address */}
            {(order.address || order.city) && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
                  Dirección de envío
                </p>
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  border: "1px solid #f1f5f9", background: "#f8fafc",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "#e0f2fe", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    {order.address && <p style={{ fontSize: 13, color: "#374151", margin: "0 0 2px", fontWeight: 500 }}>{order.address}</p>}
                    {(order.city || order.country) && (
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                        {[order.city, order.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
                  Notas del pedido
                </p>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.6 }}>{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: actions + meta */}
          <div style={{
            width: 220, borderLeft: "1px solid #f8fafc",
            background: "#fafafa", padding: "24px 20px",
            display: "flex", flexDirection: "column", gap: 10,
            flexShrink: 0, overflowY: "auto",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
              Acciones
            </p>

            {isCompleted ? (
              <div style={{
                padding: "12px", borderRadius: 10,
                background: "#ecfdf5", border: "1px solid #a7f3d0",
                textAlign: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ marginBottom: 4 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <path d="m9 11 3 3L22 4"/>
                </svg>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#047857", margin: 0 }}>Pedido completado</p>
                <p style={{ fontSize: 11, color: "#6ee7b7", margin: "4px 0 0" }}>Entrega confirmada</p>
              </div>
            ) : (
              <>
                {flow && (
                  <ActionBtn
                    label={flow.label}
                    bg={flow.color}
                    hov={flow.hov}
                    onClick={() => onStatusChange(order.id, flow.next)}
                  />
                )}

                {/* Cancel — only up to listo_envio */}
                {["nuevo", "en_preparacion", "empaquetando"].includes(order.status) && (
                  confirmCancel ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <p style={{ fontSize: 12, color: "#64748b", background: "#fff", padding: "10px 12px", borderRadius: 10, border: "1px solid #f1f5f9", margin: 0, lineHeight: 1.5 }}>
                        ¿Cancelar este pedido?
                      </p>
                      <ActionBtn label="Sí, cancelar" bg="#ef4444" hov="#dc2626" onClick={() => { onStatusChange(order.id, "cancelado"); setConfirmCancel(false); onClose(); }} />
                      <button onClick={() => setConfirmCancel(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: "4px 0", fontFamily: "inherit" }}>
                        Volver
                      </button>
                    </div>
                  ) : (
                    <ActionBtn
                      outline
                      outlineColor="#ef4444"
                      label="Cancelar pedido"
                      onClick={() => setConfirmCancel(true)}
                    />
                  )
                )}
              </>
            )}

            {/* Meta */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
              <MetaRow label="ID" value={`#${order.id}`} />
              {order.created_at && <MetaRow label="Fecha" value={fdateShort(order.created_at)} />}
              {order.total_amount != null && <MetaRow label="Total" value={money(order.total_amount)} bold />}
              {order.items && <MetaRow label="Productos" value={order.items.length} />}
              {order.priority && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Prioridad</span>
                  <PriorityBadge priority={order.priority} />
                </div>
              )}
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
      <span style={{ fontSize: 11, color: "#475569", fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

/* ================= COLUMN ================= */
function Column({ status, orders, onDrop, onDragStart, onOpen }) {
  const s = STATUS[status];
  const [dragOver, setDragOver] = useState(false);

  const colRevenue = orders.reduce((a, o) => a + (o.total_amount ?? 0), 0);

  return (
    <div style={{ minWidth: 228, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 10, background: "#fff",
        border: `1px solid ${s.header.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{s.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {orders.length > 0 && (
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{money(colRevenue)}</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#94a3b8",
            background: "#f1f5f9", borderRadius: 99,
            padding: "1px 7px", minWidth: 20, textAlign: "center",
          }}>
            {orders.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => { setDragOver(false); onDrop(status); }}
        style={{
          display: "flex", flexDirection: "column", gap: 8,
          padding: 8, borderRadius: 12, minHeight: 120,
          border: `2px dashed ${dragOver ? s.dot : "#e2e8f0"}`,
          background: dragOver ? `${s.dot}12` : "#f8fafc",
          transition: "all 0.15s",
        }}
      >
        {orders.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
            <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>Sin pedidos</p>
          </div>
        )}
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} onDragStart={onDragStart} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

/* ================= BOARD ================= */
export default function OrdersBoard() {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const dragId = useRef(null);

  useEffect(() => {
    api.getAll().then(setOrders).catch(() => setOrders([]));
  }, []);

  const updateStatus = async (id, status) => {
    const backup = [...orders];
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await api.update(id, status);
    } catch {
      setOrders(backup);
    }
  };

  const handleDrop = (status) => {
    const id = dragId.current;
    if (!id) return;
    const o = orders.find((x) => x.id === id);
    if (o && o.status !== status) updateStatus(id, status);
    dragId.current = null;
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(o.id).includes(search);
      const matchPriority = priorityFilter === "all" || o.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [orders, search, priorityFilter]);

  const grouped = useMemo(() =>
    STATUS_ORDER.reduce((acc, s) => {
      acc[s] = filtered.filter((o) => o.status === s);
      return acc;
    }, {}),
    [filtered]
  );

  const selectedOrder = selectedId != null ? orders.find((o) => o.id === selectedId) ?? null : null;

  // Stats
  const total = orders.length;
  const totalRevenue = orders.filter(o => o.status !== "cancelado").reduce((a, o) => a + (o.total_amount ?? 0), 0);
  const completados = orders.filter((o) => o.status === "completado").length;
  const urgentes = orders.filter((o) => o.priority === "alta" && o.status !== "completado").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Panel de pedidos
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>
              Gestión logística — vista Kanban
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Priority filter */}
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { key: "all", label: "Todos" },
                { key: "alta", label: "Urgente" },
                { key: "media", label: "Media" },
                { key: "baja", label: "Baja" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPriorityFilter(key)}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", border: "1px solid",
                    borderColor: priorityFilter === key ? "#6366f1" : "#e2e8f0",
                    background: priorityFilter === key ? "#eef2ff" : "#fff",
                    color: priorityFilter === key ? "#4f46e5" : "#64748b",
                    transition: "all 0.15s", fontFamily: "inherit",
                  }}
                >{label}</button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#cbd5e1" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedido..."
                style={{
                  paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 9,
                  background: "#f8fafc", outline: "none", width: 200,
                  color: "#374151", fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[
            { label: "Total pedidos", value: total, color: "#334155" },
            { label: "Facturación", value: money(totalRevenue), color: "#6366f1" },
            { label: "Completados", value: completados, color: "#059669" },
            { label: "Urgentes", value: urgentes, color: "#ef4444" },
          ].map((stat, i) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 20, background: "#f1f5f9", marginRight: 24 }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div style={{ padding: 24, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 12, minWidth: "max-content" }}>
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              orders={grouped[status]}
              onDrop={handleDrop}
              onDragStart={(id) => { dragId.current = id; }}
              onOpen={(id) => setSelectedId(id)}
            />
          ))}
        </div>
      </div>

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedId(null)}
        onStatusChange={(id, status) => { updateStatus(id, status); setSelectedId(null); }}
      />
    </div>
  );
}
