import { useEffect, useState } from "react";

const STATUS = {
  new:         { label: "Nueva",        accent: "bg-slate-400",   badge: "bg-slate-100 text-slate-700" },
  contacted:   { label: "Contactado",   accent: "bg-blue-400",    badge: "bg-blue-50 text-blue-700" },
  quote_sent:  { label: "Presupuesto",  accent: "bg-purple-400",  badge: "bg-purple-50 text-purple-700" },
  approved:    { label: "Aprobado",     accent: "bg-green-400",   badge: "bg-green-50 text-green-700" },
  in_progress: { label: "En curso",     accent: "bg-orange-400",  badge: "bg-orange-50 text-orange-700" },
  done:        { label: "Finalizado",   accent: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700" },
  rejected:    { label: "Rechazado",    accent: "bg-red-400",     badge: "bg-red-50 text-red-700" },
};

const STATUS_ORDER = [
  "new", "contacted", "quote_sent", "approved", "in_progress", "done", "rejected",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function RequestCard({ req, onDragStart }) {
  const s = STATUS[req.status];
  return (
    <div
      draggable
      onDragStart={() => onDragStart(req.id)}
      className="bg-white border border-slate-100 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-slate-200 transition-colors group"
    >
      <p className="text-sm font-semibold text-slate-800 mb-0.5">{req.name}</p>
      <p className="text-xs text-slate-400 mb-2">{req.email}</p>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
        {req.description}
      </p>
      {req.image_url && (
        <img
          src={req.image_url}
          alt="Referencia"
          className="w-full h-20 object-cover rounded-lg mb-3 border border-slate-100"
        />
      )}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
          {s.label}
        </span>
        <span className="text-xs text-slate-300">{formatDate(req.created_at)}</span>
      </div>
    </div>
  );
}

function Column({ status, items, onDrop }) {
  const s = STATUS[status];
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="min-w-[220px] max-w-[220px] flex flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${s.accent}`} />
          <span className="text-xs font-semibold text-slate-600">{s.label}</span>
        </div>
        <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={() => { setIsDragOver(false); onDrop(status); }}
        className={`flex flex-col gap-2 flex-1 min-h-[80px] rounded-2xl p-2 border transition-colors ${
          isDragOver
            ? "border-orange-300 bg-orange-50/50 border-dashed"
            : "border-slate-100 bg-slate-50"
        }`}
      >
        {items.map((req) => (
          <RequestCard key={req.id} req={req} onDragStart={() => {}} />
        ))}
      </div>
    </div>
  );
}

export default function RequestsBoard() {
  const [requests, setRequests] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/requests")
      .then((res) => res.json())
      .then((data) => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    await fetch(`http://localhost:8000/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => loadRequests());
  };

  const handleDrop = (status) => {
    if (!draggedId) return;
    const req = requests.find((r) => r.id === draggedId);
    if (req && req.status !== status) updateStatus(draggedId, status);
    setDraggedId(null);
  };

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = requests.filter((r) => r.status === status);
    return acc;
  }, {});

  const active = requests.filter(
    (r) => r.status !== "done" && r.status !== "rejected"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Gestión de solicitudes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Arrastra las tarjetas para cambiar el estado de cada solicitud
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex gap-2">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-extrabold text-slate-800">{requests.length}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-extrabold text-orange-500">{active}</p>
            <p className="text-xs text-slate-400">Activas</p>
          </div>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-slate-400">
          Cargando solicitudes…
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              items={grouped[status]}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
