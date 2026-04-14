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
  "new",
  "pending",
  "contacted",
  "quote_sent",
  "approved",
  "in_progress",
  "done",
  "rejected",
];

const STATUS_FLOW = {
  new:         { next: "pending",    label: "Marcar pendiente",    color: "bg-amber-500 hover:bg-amber-600" },
  pending:     { next: "contacted",  label: "Marcar contactado",   color: "bg-blue-500 hover:bg-blue-600" },
  contacted:   { next: "quote_sent", label: "Enviar presupuesto",  color: "bg-violet-500 hover:bg-violet-600" },
  quote_sent:  { next: "approved",   label: "Aprobar presupuesto", color: "bg-emerald-500 hover:bg-emerald-600" },
  approved:    { next: "in_progress",label: "Iniciar trabajo",     color: "bg-orange-500 hover:bg-orange-600" },
  in_progress: { next: "done",       label: "Finalizar",           color: "bg-teal-500 hover:bg-teal-600" },
};

/* ================= HELPERS ================= */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function InitialsAvatar({ name }) {
  const parts = (name || "?").trim().split(" ");
  const initials =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold uppercase flex-shrink-0 ${colors[idx]}`}
    >
      {initials.toUpperCase()}
    </div>
  );
}

/* ================= CARD ================= */
function RequestCard({ req, onDragStart, onOpen }) {
  const s = STATUS[req.status];
  return (
    <div
      draggable
      onDragStart={() => onDragStart(req.id)}
      onClick={() => onOpen(req)}
      className="group bg-white rounded-xl border border-slate-100 p-3.5 cursor-grab active:cursor-grabbing hover:border-slate-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-200"
    >
      <div className="flex items-start gap-2.5">
        <InitialsAvatar name={req.name} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
            {req.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {req.email}
          </p>
        </div>
      </div>

      {req.description && (
        <p className="text-[12px] text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
          {req.description}
        </p>
      )}

      {req.image && (
        <img
          src={`http://localhost:8000/storage/${req.image}`}
          className="w-full h-20 object-cover rounded-lg mt-2.5 border border-slate-100"
          alt="adjunto"
        />
      )}

      {req.notes && (
        <div className="mt-2.5 px-2.5 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-[11px] text-amber-700 line-clamp-1">{req.notes}</p>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.badge}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: s.dot }}
          />
          {s.label}
        </span>
        {req.created_at && (
          <span className="text-[10px] text-slate-300">
            {formatDate(req.created_at)}
          </span>
        )}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-slate-100">

        {/* LEFT */}
        <div className="flex-1 p-7 overflow-y-auto">
          <div className="flex items-start gap-3 mb-6">
            <InitialsAvatar name={request.name} />
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {request.name}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{request.email}</p>
            </div>
            <span
              className={`ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${s.badge}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: s.dot }}
              />
              {s.label}
            </span>
          </div>

          <div className="mb-5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Descripción
            </label>
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {request.description || (
                <span className="text-slate-300 italic">Sin descripción</span>
              )}
            </p>
          </div>

          {request.image && (
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Adjunto
              </label>
              <img
                src={`http://localhost:8000/storage/${request.image}`}
                className="mt-2 w-full rounded-xl border border-slate-100"
                alt="adjunto"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Nota interna
              </label>
              <span className="text-[10px] text-slate-300">
                Se guarda automáticamente
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Añade una nota interna..."
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-64 border-l border-slate-100 bg-slate-50/60 p-5 flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Acciones
          </p>

          {isFinished ? (
            <>
              {!confirmAction && (
                <button
                  onClick={() => setConfirmAction("delete")}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Eliminar solicitud
                </button>
              )}
              {confirmAction === "delete" && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                    ¿Eliminar esta solicitud definitivamente?
                  </p>
                  <button
                    onClick={executeDelete}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 transition"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {flow && (
                <button
                  onClick={() => executeAction(flow.next)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium text-white transition ${flow.color}`}
                >
                  {flow.label}
                </button>
              )}

              {isQuoteSent && (
                <>
                  {confirmAction === "reject" ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                        ¿Marcar el presupuesto como rechazado?
                      </p>
                      <button
                        onClick={() => executeAction("rejected")}
                        className="w-full py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Sí, rechazar
                      </button>
                      <button
                        onClick={() => setConfirmAction(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmAction("reject")}
                      className="w-full py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition"
                    >
                      Rechazar presupuesto
                    </button>
                  )}
                </>
              )}
            </>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              ← Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COLUMN ================= */
function Column({ status, items, onDrop, onDragStart, onOpen }) {
  const s = STATUS[status];
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="min-w-[232px] flex flex-col gap-2">
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-xl border ${s.header} bg-white`}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: s.dot }}
          />
          <span className="text-[12px] font-semibold text-slate-700">
            {s.label}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {items.length}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => {
          setDragOver(false);
          onDrop(status);
        }}
        className={`flex flex-col gap-2 p-2 rounded-xl min-h-[120px] border-2 border-dashed transition-all duration-150 ${
          dragOver ? s.dragOver : "border-slate-100 bg-slate-50/50"
        }`}
      >
        {items.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-[11px] text-slate-300">Sin solicitudes</p>
          </div>
        )}
        {items.map((req) => (
          <RequestCard
            key={req.id}
            req={req}
            onDragStart={onDragStart}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

/* ================= BOARD ================= */
export default function RequestsBoard() {
  const [requests, setRequests] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

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
    ? requests.filter(
        (r) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase())
      )
    : requests;

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = filtered.filter((r) => r.status === status);
    return acc;
  }, {});

  const total = requests.length;
  const done = requests.filter((r) => r.status === "done").length;
  const inProgress = requests.filter(
    (r) => !["done", "rejected", "new"].includes(r.status)
  ).length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestión de solicitudes
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Panel de control — vista Kanban
            </p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar solicitud..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition w-56 placeholder-slate-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Stat label="Total" value={total} color="text-slate-700" />
          <div className="w-px h-5 bg-slate-100" />
          <Stat label="En proceso" value={inProgress} color="text-violet-600" />
          <div className="w-px h-5 bg-slate-100" />
          <Stat label="Finalizados" value={done} color="text-emerald-600" />
          <div className="w-px h-5 bg-slate-100" />
          <Stat label="Rechazados" value={rejected} color="text-red-500" />
        </div>
      </div>

      <div className="px-6 py-6 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              items={grouped[status]}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onOpen={setSelected}
            />
          ))}
        </div>
      </div>

      <RequestModal
        request={selected}
        onClose={() => setSelected(null)}
        onStatusChange={updateStatus}
        onDelete={deleteRequest}
      />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-lg font-bold leading-none ${color}`}>{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
