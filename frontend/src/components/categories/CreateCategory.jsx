import { useState } from "react";

export default function CreateCategory() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", parent_id: null });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  function resetForm() {
    setForm({ name: "", description: "", parent_id: null });
    setMessage("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name.trim()) {
      setMessage("Por favor completa el nombre de la categoría");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || Object.values(data.errors || {}).flat().join(", ");
        throw new Error(msg);
      }

      setMessage(`✓ Categoría "${data.name}" creada correctamente`);
      resetForm();

      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1800);

    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith("✓");

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 ${
        open
          ? "border-orange-200 shadow-md"
          : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
      }`}
    >
      {/* Cabecera / toggle */}
      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);
          setMessage("");
        }}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div
          className={`w-2 h-10 rounded-full flex-shrink-0 transition-colors ${
            open ? "bg-orange-500" : "bg-slate-200"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">
            Crear nueva categoría
          </p>
          <p className="text-slate-400 text-sm">
            Nombre, descripción y categoría padre
          </p>
        </div>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
            open
              ? "bg-orange-100 text-orange-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Formulario desplegable */}
      {open && (
        <div className="border-t border-slate-100 px-6 py-5">
          {message && (
            <div
              className={`mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {isSuccess ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="Ej: Herramientas manuales"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Descripción
              </label>
              <textarea
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none"
                placeholder="Descripción de la categoría..."
                rows="3"
                value={form.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                ID Categoría Padre{" "}
                <span className="normal-case font-normal text-slate-400">
                  (opcional)
                </span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="ID de la categoría padre"
                value={form.parent_id || ""}
                onChange={(e) =>
                  handleChange(
                    "parent_id",
                    e.target.value
                      ? parseInt(e.target.value)
                      : null
                  )
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando…" : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}