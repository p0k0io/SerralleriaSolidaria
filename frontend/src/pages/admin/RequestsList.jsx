import { useEffect, useState } from "react";

const STATUS = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  in_progress: { label: "En curso", color: "bg-blue-100 text-blue-700 border-blue-200" },
  done: { label: "Finalizado", color: "bg-green-100 text-green-700 border-green-200" },
};

export default function RequestsList() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    fetch("http://localhost:8000/api/requests")
      .then(res => res.json())
      .then(setRequests);
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:8000/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadRequests();
  };

  const filtered = requests.filter(r =>
    filter === "all" ? true : r.status === filter
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Solicitudes de clientes
        </h1>
        <p className="text-sm text-slate-500">
          Gestiona las peticiones personalizadas
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "in_progress", "done"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition border ${
              filter === f
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
            }`}
          >
            {f === "all" ? "Todas" : STATUS[f]?.label}
          </button>
        ))}
      </div>

      {/* LISTADO */}
      <div className="grid gap-4">

        {filtered.map(req => (
          <div
            key={req.id}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >

            {/* INFO */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{req.name}</p>

                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS[req.status]?.color}`}>
                  {STATUS[req.status]?.label || req.status}
                </span>
              </div>

              <p className="text-sm text-slate-500">{req.email}</p>

              <p className="text-sm text-slate-700">
                {req.description}
              </p>
            </div>

            {/* ACCIONES */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap">

              <button
                onClick={() => updateStatus(req.id, "pending")}
                className="text-xs px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
              >
                Pendiente
              </button>

              <button
                onClick={() => updateStatus(req.id, "in_progress")}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                En curso
              </button>

              <button
                onClick={() => updateStatus(req.id, "done")}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
              >
                Finalizado
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}