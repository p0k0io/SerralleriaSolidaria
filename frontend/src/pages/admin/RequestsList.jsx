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
  "new",
  "contacted",
  "quote_sent",
  "approved",
  "in_progress",
  "done",
  "rejected",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

/* ================= CARD ================= */
function RequestCard({ req, onDragStart, onStatusChange }) {
  const s = STATUS[req.status];

  return (
    <div
      draggable
      onDragStart={() => onDragStart(req.id)}
      className="bg-white border border-slate-100 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-slate-200 transition"
    >
      <p className="text-sm font-semibold text-slate-800">{req.name}</p>
      <p className="text-xs text-slate-400">{req.email}</p>

      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
        {req.description}
      </p>

      {/* IMAGEN */}
      {req.image && (
        <img
          src={`http://localhost:8000/storage/${req.image}`}
          alt="ref"
          className="w-full h-20 object-cover rounded-lg mt-3 border"
        />
      )}

      {/* BOTONES SOLO EN PRESUPUESTO */}
      {req.status === "quote_sent" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onStatusChange(req.id, "approved")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded-lg"
          >
            Aprobar
          </button>

          <button
            onClick={() => onStatusChange(req.id, "rejected")}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 rounded-lg"
          >
            Rechazar
          </button>
        </div>
      )}

      {/* STATUS */}
      <div className="flex justify-between items-center mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${s.badge}`}>
          {s.label}
        </span>

        <span className="text-xs text-slate-300">
          {formatDate(req.created_at)}
        </span>
      </div>
    </div>
  );
}

/* ================= COLUMN ================= */
function Column({ status, items, onDrop, onDragStart, onStatusChange }) {
  const s = STATUS[status];
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="min-w-[230px] flex flex-col gap-2">
      {/* HEADER */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${s.accent}`} />
          <span className="text-xs font-semibold">{s.label}</span>
        </div>

        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* DROP ZONE */}
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
        className={`flex flex-col gap-2 p-2 rounded-xl min-h-[100px] border transition ${
          dragOver
            ? "border-orange-400 bg-orange-50"
            : "border-slate-100 bg-slate-50"
        }`}
      >
        {items.map((req) => (
          <RequestCard
            key={req.id}
            req={req}
            onDragStart={onDragStart}
            onStatusChange={onStatusChange}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/requests");
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  /* DRAG START */
  const handleDragStart = (id) => {
    setDraggedId(id);
  };

  /* UPDATE STATUS */
  const updateStatus = async (id, status) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    try {
      await fetch(`http://localhost:8000/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
      loadRequests();
    }
  };

  /* DROP */
  const handleDrop = (status) => {
    if (!draggedId) return;

    const req = requests.find((r) => r.id === draggedId);

    if (req && req.status !== status) {
      updateStatus(draggedId, status);
    }

    setDraggedId(null);
  };

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = requests.filter((r) => r.status === status);
    return acc;
  }, {});

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status) => (
        <Column
          key={status}
          status={status}
          items={grouped[status]}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onStatusChange={updateStatus}
        />
      ))}
    </div>
  );
}