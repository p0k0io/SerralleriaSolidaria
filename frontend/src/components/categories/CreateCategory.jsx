import { useEffect, useState } from "react";
import { useAdminToast } from "../../context/AdminToastContext";

// ── ICONOS ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── FIELD WRAPPER ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 focus:bg-white transition-all duration-150";

// ── SPINNER ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CreateCategory({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", parent_id: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const { showToast } = useAdminToast();

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const resetForm = () => {
    setForm({ name: "", description: "", parent_id: "" });
    setMessage("");
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await fetch("http://localhost:8000/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || data.data || []);
    } catch (err) {
      console.error("CreateCategory: Error loading categories", err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

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
        body: JSON.stringify({
          ...form,
          parent_id: form.parent_id ? parseInt(form.parent_id) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || Object.values(data.errors || {}).flat().join(", ");
        throw new Error(msg);
      }

      setMessage(`success:${data.category.name}`);
      resetForm();
      await fetchCategories();
      showToast(`Categoría ${data.category.name} creada correctamente`);
      if (onCreated) onCreated();

      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1400);
    } catch (err) {
      setMessage(`error:${err.message}`);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith("success:");
  const isError = message.startsWith("error:");
  const successName = isSuccess ? message.replace("success:", "") : "";
  const errorText = isError ? message.replace("error:", "") : message;

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
        open
          ? "border-amber-200 shadow-lg shadow-amber-50"
          : "border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200"
      }`}
      style={{ boxShadow: open ? "0 4px 24px rgba(251,146,60,0.10), 0 1px 4px rgba(0,0,0,0.04)" : undefined }}
    >
      {/* ── HEADER TOGGLE ── */}
      <button
        type="button"
        onClick={() => { setOpen(!open); if (open) resetForm(); }}
        className="w-full flex items-center gap-4 px-5 py-4 text-left group"
      >
        {/* Accent strip */}
        <div
          className={`w-1 h-10 rounded-full transition-all duration-300 ${
            open ? "bg-gradient-to-b from-amber-400 to-orange-500" : "bg-stone-200 group-hover:bg-stone-300"
          }`}
        />

        {/* Icon badge */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            open
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-stone-100 text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-500"
          }`}
        >
          <PlusIcon />
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className={`font-semibold text-sm transition-colors ${open ? "text-stone-900" : "text-stone-700"}`}>
            Crear categoría
          </p>
          <p className="text-stone-400 text-xs mt-0.5">Nombre, descripción y categoría padre</p>
        </div>

        {/* Chevron */}
        <span className="text-stone-300 group-hover:text-stone-400 transition-colors">
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* ── FORM ── */}
      {open && (
        <div className="border-t border-stone-100 px-5 py-5 space-y-4">

          {/* Feedback */}
          {(isSuccess || isError || (!isSuccess && !isError && message)) && (
            <div
              className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              <span className="mt-0.5 flex-shrink-0">
                {isSuccess ? <CheckIcon /> : <AlertIcon />}
              </span>
              <span>
                {isSuccess
                  ? <>Categoría <strong>"{successName}"</strong> creada correctamente</>
                  : errorText}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre *">
              <input
                className={inputClass}
                placeholder="Ej: Electrónica, Ropa, Deportes…"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="Descripción">
              <textarea
                className={`${inputClass} resize-none h-20`}
                placeholder="Descripción opcional de la categoría…"
                value={form.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
              />
            </Field>

            <Field label="Categoría padre">
              <select
                className={inputClass}
                value={form.parent_id}
                onChange={(e) => handleChange("parent_id", e.target.value)}
                disabled={loadingCats}
              >
                <option value="">Sin categoría padre</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); resetForm(); }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600
                  hover:bg-stone-50 hover:border-stone-300 transition-colors duration-150"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-amber-500
                  hover:bg-orange-400
                  active:bg-amber-600
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-sm shadow-orange-200 transition-all duration-150"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Creando…
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Crear categoría
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
