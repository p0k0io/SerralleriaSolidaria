import { useEffect, useState, useRef } from "react";

/* ================= STATUS ================= */
const STATUS = {
  new: {
    label: "Nueva",
    dot: "#94a3b8",
    badge: "bg-slate-100 text-slate-600",
    header: "border-slate-200",
    dragOver: "border-slate-400 bg-slate-100/60",
  },
  pending: {
    label: "Pendiente",
    dot: "#f59e0b",
    badge: "bg-amber-50 text-amber-700",
    header: "border-amber-200",
    dragOver: "border-amber-400 bg-amber-50/60",
  },
  contacted: {
    label: "Contactado",
    dot: "#3b82f6",
    badge: "bg-blue-50 text-blue-700",
    header: "border-blue-200",
    dragOver: "border-blue-400 bg-blue-50/60",
  },
  quote_sent: {
    label: "Presupuesto",
    dot: "#8b5cf6",
    badge: "bg-violet-50 text-violet-700",
    header: "border-violet-200",
    dragOver: "border-violet-400 bg-violet-50/60",
  },
  approved: {
    label: "Aprobado",
    dot: "#10b981",
    badge: "bg-emerald-50 text-emerald-700",
    header: "border-emerald-200",
    dragOver: "border-emerald-400 bg-emerald-50/60",
  },
  in_progress: {
    label: "En curso",
    dot: "#f97316",
    badge: "bg-orange-50 text-orange-700",
    header: "border-orange-200",
    dragOver: "border-orange-400 bg-orange-50/60",
  },
  done: {
    label: "Finalizado",
    dot: "#059669",
    badge: "bg-teal-50 text-teal-700",
    header: "border-teal-200",
    dragOver: "border-teal-400 bg-teal-50/60",
  },
  rejected: {
    label: "Rechazado",
    dot: "#ef4444",
    badge: "bg-red-50 text-red-700",
    header: "border-red-200",
    dragOver: "border-red-400 bg-red-50/60",
  },
};

const STATUS_ORDER = [
  "new", "pending", "contacted", "quote_sent",
  "approved", "in_progress", "done", "rejected",
];

const STATUS_FLOW = {
  new:         { next: "pending",     label: "Marcar pendiente",    color: "#f59e0b", hov: "#d97706" },
  pending:     { next: "contacted",   label: "Marcar contactado",   color: "#3b82f6", hov: "#2563eb" },
  contacted:   { next: "quote_sent",  label: "Enviar presupuesto",  color: "#8b5cf6", hov: "#7c3aed" },
  quote_sent:  { next: "approved",    label: "Aprobar presupuesto", color: "#10b981", hov: "#059669" },
  approved:    { next: "in_progress", label: "Iniciar trabajo",     color: "#f97316", hov: "#ea580c" },
  in_progress: { next: "done",        label: "Finalizar",           color: "#059669", hov: "#047857" },
};

/* ================= HELPERS ================= */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function InitialsAvatar({ name, size = "sm" }) {
  const parts = (name || "?").trim().split(" ");
  const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  const palettes = [
    { bg: "#ede9fe", text: "#6d28d9" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#047857" },
    { bg: "#fef3c7", text: "#b45309" },
    { bg: "#ffe4e6", text: "#be123c" },
  ];
  const p = palettes[(name || "").charCodeAt(0) % palettes.length];
  const dim = size === "lg" ? 48 : 32;
  const fs = size === "lg" ? 16 : 11;
  return (
    <div style={{
      width: dim, height: dim, borderRadius: "50%",
      background: p.bg, color: p.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 600, flexShrink: 0, textTransform: "uppercase",
      letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}

/* ================= CARD (minimal) ================= */
function RequestCard({ req, onDragStart, onOpen }) {
  const s = STATUS[req.status];
  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(req.id); }}
      onClick={() => onOpen(req)}
      style={{
        background: "#fff",
        border: "1px solid #f1f5f9",
        borderRadius: 12,
        padding: "10px 12px",
        cursor: "grab",
        transition: "box-shadow 0.15s, border-color 0.15s",
        userSelect: "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#f1f5f9";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <InitialsAvatar name={req.name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {req.name}
          </p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {req.email}
          </p>
          {req.phone && (
            <p style={{ fontSize: 11, color: "#cbd5e1", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {req.phone}
            </p>
          )}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 500,
          padding: "2px 7px", borderRadius: 99,
          background: s.badge.includes("slate") ? "#f1f5f9" : undefined,
          flexShrink: 0,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }} />
        </span>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */
function RequestModal({ request, onClose, onStatusChange, onDelete }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [note, setNote] = useState("");
  const saveTimer = useRef(null);

  useEffect(() => {
    if (request) {
      setNote(request.notes || "");
      setConfirmAction(null);
    }
  }, [request?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!request) return null;

  const flow = STATUS_FLOW[request.status] || null;
  const isFinished = request.status === "done" || request.status === "rejected";
  const isQuoteSent = request.status === "quote_sent";
  const s = STATUS[request.status];

  const executeAction = async (status) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await onStatusChange(request.id, status, note);
    setConfirmAction(null);
    onClose();
  };

  const executeDelete = async () => {
    await onDelete(request.id);
    setConfirmAction(null);
    onClose();
  };

  const handleNoteChange = (val) => {
    setNote(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onStatusChange(request.id, request.status, val);
    }, 800);
  };

  const currentIdx = STATUS_ORDER.indexOf(request.status);
  const progressPct = Math.round((currentIdx / (STATUS_ORDER.length - 1)) * 100);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 780,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
        overflow: "hidden", maxHeight: "90vh",
        border: "1px solid #f1f5f9",
      }}>

        {/* ── TOP HEADER BAR ── */}
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #f8fafc" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <InitialsAvatar name={request.name} size="lg" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                  {request.name}
                </h2>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 600,
                  padding: "3px 10px", borderRadius: 99,
                  background: s.badge.split(" ")[0].replace("bg-", "").includes("slate") ? "#f1f5f9"
                    : s.badge.split(" ")[0].replace("bg-", "").includes("amber") ? "#fffbeb"
                    : s.badge.split(" ")[0].replace("bg-", "").includes("blue") ? "#eff6ff"
                    : s.badge.split(" ")[0].replace("bg-", "").includes("violet") ? "#f5f3ff"
                    : s.badge.split(" ")[0].replace("bg-", "").includes("emerald") ? "#ecfdf5"
                    : s.badge.split(" ")[0].replace("bg-", "").includes("orange") ? "#fff7ed"
                    : s.badge.split(" ")[0].replace("bg-", "").includes("teal") ? "#f0fdfa"
                    : "#fef2f2",
                  color: s.dot,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                  {s.label}
                </span>
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 6, flexWrap: "wrap" }}>
                {request.email && (
                  <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    {request.email}
                  </span>
                )}
                {request.phone && (
                  <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4a2 2 0 0 1 1.49-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.91 8.71a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {request.phone}
                  </span>
                )}
                {request.created_at && (
                  <span style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {formatDate(request.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#cbd5e1", padding: 4, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#475569"}
              onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 0, paddingBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Progreso</span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{progressPct}%</span>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: `linear-gradient(90deg, ${s.dot}, ${s.dot}cc)`,
                width: `${progressPct}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
            {/* Step labels */}
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

          {/* LEFT: content */}
          <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Description */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
                Descripción
              </p>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
                {request.description || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Sin descripción</span>}
              </p>
            </div>

            {/* Image */}
            {request.image && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
                  Adjunto
                </p>
                <img
                  src={`http://localhost:8000/storage/${request.image}`}
                  style={{ width: "100%", borderRadius: 12, border: "1px solid #f1f5f9", display: "block" }}
                  alt="adjunto"
                />
              </div>
            )}

            {/* Note */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                  Nota interna
                </p>
                <span style={{ fontSize: 10, color: "#cbd5e1" }}>Se guarda automáticamente</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Añade una nota interna..."
                rows={4}
                style={{
                  width: "100%", padding: "12px 14px", boxSizing: "border-box",
                  border: "1px solid #e2e8f0", borderRadius: 12,
                  background: "#f8fafc", fontSize: 13, color: "#374151",
                  resize: "none", outline: "none", lineHeight: 1.6,
                  fontFamily: "inherit", transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>

          {/* RIGHT: actions */}
          <div style={{
            width: 220, borderLeft: "1px solid #f8fafc",
            background: "#fafafa", padding: "24px 20px",
            display: "flex", flexDirection: "column", gap: 10,
            flexShrink: 0,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
              Acciones
            </p>

            {isFinished ? (
              confirmAction === "delete" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12, color: "#64748b", background: "#fff", padding: "10px 12px", borderRadius: 10, border: "1px solid #f1f5f9", margin: 0, lineHeight: 1.5 }}>
                    ¿Eliminar esta solicitud definitivamente?
                  </p>
                  <ActionBtn label="Sí, eliminar" bg="#0f172a" hov="#1e293b" onClick={executeDelete} />
                  <button onClick={() => setConfirmAction(null)} style={cancelBtnStyle}>Cancelar</button>
                </div>
              ) : (
                <ActionBtn label="Eliminar solicitud" bg="#ef4444" hov="#dc2626" onClick={() => setConfirmAction("delete")} />
              )
            ) : (
              <>
                {flow && (
                  <ActionBtn
                    label={flow.label}
                    bg={flow.color}
                    hov={flow.hov}
                    onClick={() => executeAction(flow.next)}
                  />
                )}

                {isQuoteSent && (
                  confirmAction === "reject" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <p style={{ fontSize: 12, color: "#64748b", background: "#fff", padding: "10px 12px", borderRadius: 10, border: "1px solid #f1f5f9", margin: 0, lineHeight: 1.5 }}>
                        ¿Rechazar este presupuesto?
                      </p>
                      <ActionBtn label="Sí, rechazar" bg="#ef4444" hov="#dc2626" onClick={() => executeAction("rejected")} />
                      <button onClick={() => setConfirmAction(null)} style={cancelBtnStyle}>Cancelar</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmAction("reject")}
                      style={{
                        width: "100%", padding: "10px 0", borderRadius: 10,
                        fontSize: 13, fontWeight: 500, cursor: "pointer",
                        background: "none", border: "1px solid #fecaca",
                        color: "#ef4444", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      Rechazar presupuesto
                    </button>
                  )
                )}
              </>
            )}

            {/* Divider + meta info */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <MetaRow icon="id" label="ID" value={`#${request.id}`} />
                {request.created_at && <MetaRow icon="cal" label="Creado" value={formatDate(request.created_at)} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* tiny helpers */
const cancelBtnStyle = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: 12, color: "#94a3b8", padding: "4px 0", textAlign: "center",
  transition: "color 0.15s",
};

function ActionBtn({ label, bg, hov, onClick }) {
  const [hover, setHover] = useState(false);
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
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function MetaRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ================= COLUMN ================= */
function Column({ status, items, onDrop, onDragStart, onOpen }) {
  const s = STATUS[status];
  const [dragOver, setDragOver] = useState(false);

  return (
    <div style={{ minWidth: 228, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 10, background: "#fff",
        border: `1px solid`,
        borderColor: s.header.replace("border-", "").includes("slate") ? "#e2e8f0"
          : s.header.replace("border-", "").includes("amber") ? "#fde68a"
          : s.header.replace("border-", "").includes("blue") ? "#bfdbfe"
          : s.header.replace("border-", "").includes("violet") ? "#ddd6fe"
          : s.header.replace("border-", "").includes("emerald") ? "#a7f3d0"
          : s.header.replace("border-", "").includes("orange") ? "#fed7aa"
          : s.header.replace("border-", "").includes("teal") ? "#99f6e4"
          : "#fecaca",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{s.label}</span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: "#94a3b8",
          background: "#f1f5f9", borderRadius: 99,
          padding: "1px 7px", minWidth: 20, textAlign: "center",
        }}>
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => { setDragOver(false); onDrop(status); }}
        style={{
          display: "flex", flexDirection: "column", gap: 8,
          padding: 8, borderRadius: 12, minHeight: 120,
          border: `2px dashed`,
          borderColor: dragOver
            ? s.dot
            : "#e2e8f0",
          background: dragOver ? `${s.dot}10` : "#f8fafc",
          transition: "all 0.15s",
        }}
      >
        {items.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
            <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>Sin solicitudes</p>
          </div>
        )}
        {items.map((req) => (
          <RequestCard key={req.id} req={req} onDragStart={onDragStart} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

/* ================= BOARD ================= */
export default function RequestsBoard() {
  const [requests, setRequests] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    const res = await fetch("http://localhost:8000/api/requests");
    setRequests(await res.json());
  };

  const handleDragStart = (id) => setDraggedId(id);

  const updateStatus = async (id, status, notes = "") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, notes } : r))
    );
    await fetch(`http://localhost:8000/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
  };

  const deleteRequest = async (id) => {
    await fetch(`http://localhost:8000/api/requests/${id}`, { method: "DELETE" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDrop = (status) => {
    if (!draggedId) return;
    const req = requests.find((r) => r.id === draggedId);
    if (req && req.status !== status) updateStatus(draggedId, status, req.notes || "");
    setDraggedId(null);
  };

  const filtered = search
    ? requests.filter((r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      )
    : requests;

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = filtered.filter((r) => r.status === status);
    return acc;
  }, {});

  // Derive selected request live from state (avoids stale reference after status update)
  const selectedRequest = selectedId != null ? requests.find((r) => r.id === selectedId) ?? null : null;

  const total = requests.length;
  const done = requests.filter((r) => r.status === "done").length;
  const inProgress = requests.filter((r) => !["done", "rejected", "new"].includes(r.status)).length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Gestión de solicitudes
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>
              Panel de control — vista Kanban
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#cbd5e1" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar solicitud..."
              style={{
                paddingLeft: 32, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 10,
                background: "#f8fafc", outline: "none", width: 220,
                color: "#374151", fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[
            { label: "Total", value: total, color: "#334155" },
            { label: "En proceso", value: inProgress, color: "#8b5cf6" },
            { label: "Finalizados", value: done, color: "#059669" },
            { label: "Rechazados", value: rejected, color: "#ef4444" },
          ].map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: i > 0 ? 0 : 0 }}>
              {i > 0 && <div style={{ width: 1, height: 20, background: "#f1f5f9", marginRight: 24 }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div style={{ padding: "24px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 12, minWidth: "max-content" }}>
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              items={grouped[status]}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onOpen={(req) => setSelectedId(req.id)}
            />
          ))}
        </div>
      </div>

      <RequestModal
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        onStatusChange={updateStatus}
        onDelete={deleteRequest}
      />
    </div>
  );
}