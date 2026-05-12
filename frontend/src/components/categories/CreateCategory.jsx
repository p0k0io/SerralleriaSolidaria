import { useEffect, useState } from "react";
import { useAdminToast } from "../../context/AdminToastContext";

// ── ICONS ─────────────────────────────────────────────────────────────────────
const PlusIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
    }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ── FIELD ─────────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase =
  "w-full px-3 py-2 rounded-lg border text-[13px] text-stone-800 placeholder-stone-300 " +
  "bg-white border-stone-200 " +
  "transition-all duration-150 ease-out " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400 " +
  "hover:border-stone-300 " +
  "shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";

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
      className={`
        rounded-xl border overflow-hidden
        transition-all duration-200 ease-out
        ${open
          ? "border-stone-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]"
          : "border-stone-150 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.07)] hover:border-stone-200"
        }
      `}
    >
      {/* ── TOGGLE HEADER ── */}
      <button
        type="button"
        onClick={() => { setOpen(!open); if (open) resetForm(); }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group focus:outline-none"
      >
        {/* Icon */}
        <div
          className={`
            w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
            transition-all duration-200 ease-out
            ${open
              ? "bg-amber-500 text-white shadow-[0_1px_3px_rgba(245,158,11,0.35)]"
              : "bg-stone-100 text-stone-400 group-hover:bg-stone-150 group-hover:text-stone-500"
            }
          `}
        >
          <div style={{
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)"
          }}>
            <PlusIcon size={13} />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-medium transition-colors duration-150 ${open ? "text-stone-900" : "text-stone-600 group-hover:text-stone-800"}`}>
            Crear categoría
          </p>
          {!open && (
            <p className="text-[11px] text-stone-400 mt-0 leading-tight">
              Nombre, descripción y categoría padre
            </p>
          )}
        </div>

        {/* Chevron */}
        <span className={`transition-colors duration-150 ${open ? "text-stone-400" : "text-stone-300 group-hover:text-stone-400"}`}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* ── FORM ── */}
      {open && (
        <div
          className="border-t border-stone-100 px-4 pb-4 pt-4 space-y-3.5"
          style={{ animation: "slideDown 0.18s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Feedback */}
          {(isSuccess || isError || (!isSuccess && !isError && message)) && (
            <div
              className={`
                flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px] font-medium border
                transition-all duration-200
                ${isSuccess
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-600 border-red-100"
                }
              `}
            >
              <span className="mt-0.5 flex-shrink-0 opacity-80">
                {isSuccess ? <CheckIcon /> : <AlertIcon />}
              </span>
              <span className="leading-snug">
                {isSuccess
                  ? <>Categoría <strong className="font-semibold">"{successName}"</strong> creada correctamente</>
                  : errorText
                }
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Nombre *">
              <input
                className={inputBase}
                placeholder="Ej: Electrónica, Ropa, Deportes…"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="Descripción">
              <textarea
                className={`${inputBase} resize-none h-[76px] leading-relaxed`}
                placeholder="Descripción opcional de la categoría…"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Field>

            <Field label="Categoría padre">
              <div className="relative">
                <select
                  className={`${inputBase} appearance-none pr-8 cursor-pointer`}
                  value={form.parent_id}
                  onChange={(e) => handleChange("parent_id", e.target.value)}
                  disabled={loadingCats}
                >
                  <option value="">Sin categoría padre</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300">
                  <ChevronIcon open={false} />
                </div>
              </div>
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => { setOpen(false); resetForm(); }}
                className="
                  px-3.5 py-2 rounded-lg border border-stone-200 bg-white
                  text-[12px] font-medium text-stone-500
                  hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700
                  active:bg-stone-100 active:scale-[0.98]
                  transition-all duration-150 ease-out
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  flex-1 flex items-center justify-center gap-1.5
                  py-2 rounded-lg
                  text-[12px] font-semibold text-white
                  bg-amber-500
                  hover:bg-amber-500/90
                  active:bg-amber-600 active:scale-[0.99]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_1px_3px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
                  transition-all duration-150 ease-out
                "
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    <span>Creando…</span>
                  </>
                ) : (
                  <>
                    <PlusIcon size={12} />
                    <span>Crear categoría</span>
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