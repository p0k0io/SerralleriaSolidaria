import { useEffect, useState, useCallback } from "react";
import { useAdminToast } from "../../context/AdminToastContext";
import CreateCategory from "./CreateCategory";

// ── ICONS ─────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── PARENT BADGE ──────────────────────────────────────────────────────────────
function ParentBadge({ name }) {
  return (
    <span className="
      inline-flex items-center gap-1 px-1.5 py-0.5
      rounded-md text-[10px] font-medium tracking-wide
      bg-amber-50 text-amber-600 border border-amber-100/80
    ">
      <FolderIcon />
      {name}
    </span>
  );
}

// ── ACTION MENU ───────────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handle = (e) => {
      if (!e.target.closest(".menu-root")) setShow(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative menu-root">
      <button
        onClick={() => setShow((p) => !p)}
        className={`
          w-7 h-7 flex items-center justify-center rounded-md
          transition-all duration-150 ease-out
          ${show
            ? "bg-stone-100 text-stone-700"
            : "text-stone-300 hover:text-stone-600 hover:bg-stone-100"
          }
        `}
      >
        <DotsIcon />
      </button>

      {show && (
        <div
          className="
            absolute right-0 mt-1 w-40 bg-white
            rounded-xl border border-stone-100
            shadow-[0_8px_24px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.05)]
            z-30 p-1 overflow-hidden
          "
          style={{ animation: "menuIn 0.12s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <style>{`
            @keyframes menuIn {
              from { opacity: 0; transform: translateY(-4px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <button
            onClick={() => { onEdit(); setShow(false); }}
            className="
              w-full flex items-center gap-2 px-2.5 py-1.5
              text-[12px] font-medium text-stone-600
              hover:bg-stone-50 hover:text-stone-900
              rounded-lg transition-colors duration-100
            "
          >
            <span className="text-stone-400"><EditIcon /></span>
            Editar
          </button>

          <div className="my-1 mx-1 border-t border-stone-100" />

          <button
            onClick={() => { onDelete(); setShow(false); }}
            className="
              w-full flex items-center gap-2 px-2.5 py-1.5
              text-[12px] font-medium text-red-500
              hover:bg-red-50/60 hover:text-red-600
              rounded-lg transition-colors duration-100
            "
          >
            <span className="opacity-80"><TrashIcon /></span>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ── CATEGORY CARD ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, onEdit, onDelete, index }) {
  const initial = cat.name.charAt(0).toUpperCase();

  return (
    <div
      className="
        group bg-white rounded-xl border border-stone-100
        px-3.5 py-3 flex items-center gap-3
        transition-all duration-200 ease-out
        hover:border-stone-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]
        hover:-translate-y-px
      "
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Avatar */}
      <div className="
        w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
        bg-gradient-to-br from-amber-50 to-orange-100
        border border-amber-100/60
      ">
        <span className="text-[12px] font-semibold text-amber-700 leading-none">
          {initial}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[13px] text-stone-800 truncate leading-tight">
          {cat.name}
        </p>
        {(cat.description || cat.parent) && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {cat.description && (
              <p className="text-[11px] text-stone-400 truncate">{cat.description}</p>
            )}
            {cat.description && cat.parent && (
              <span className="text-stone-200 text-[10px]">·</span>
            )}
            {cat.parent && <ParentBadge name={cat.parent.name} />}
          </div>
        )}
      </div>

      {/* Actions — always rendered, visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
        <ActionMenu onEdit={() => onEdit(cat)} onDelete={() => onDelete(cat.id)} />
      </div>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-xl border border-stone-100 px-3.5 py-3 flex items-center gap-3 animate-pulse"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="w-8 h-8 rounded-lg bg-stone-100 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-stone-100 rounded-full w-2/5" />
        <div className="h-2 bg-stone-50 rounded-full w-3/5" />
      </div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-3">
        <span className="text-stone-300"><FolderIcon /></span>
      </div>
      <p className="text-stone-600 font-medium text-[13px]">Sin categorías</p>
      <p className="text-stone-400 text-[12px] mt-0.5">Crea tu primera categoría para empezar</p>
    </div>
  );
}

// ── FIELD (shared) ────────────────────────────────────────────────────────────
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

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function EditModal({ category, categories, onClose, onSave }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");
  const [parentId, setParentId] = useState(category.parent_id || "");

  const submit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      parent_id: parentId ? parseInt(parentId) : null,
    });
  };

  const ChevronDown = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
      style={{
        backgroundColor: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease-out"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 24px 64px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          animation: "slideUp 0.18s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <EditIcon />
            </div>
            <p className="font-semibold text-stone-900 text-[13px]">Editar categoría</p>
          </div>
          <button
            onClick={onClose}
            className="
              w-7 h-7 flex items-center justify-center rounded-lg
              text-stone-400 hover:text-stone-700 hover:bg-stone-100
              transition-all duration-150
            "
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-5 py-4 space-y-3.5">
          <Field label="Nombre">
            <input
              className={inputBase}
              value={name}
              placeholder="Nombre de la categoría"
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field label="Descripción">
            <textarea
              className={`${inputBase} resize-none h-[76px] leading-relaxed`}
              value={description}
              placeholder="Descripción opcional…"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Categoría padre">
            <div className="relative">
              <select
                className={`${inputBase} appearance-none pr-8 cursor-pointer`}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">Sin categoría padre</option>
                {categories
                  .filter((c) => c.id !== category.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300">
                <ChevronDown />
              </div>
            </div>
          </Field>

          {/* Actions */}
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 py-2 rounded-lg border border-stone-200 bg-white
                text-[12px] font-medium text-stone-500
                hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700
                active:bg-stone-100 active:scale-[0.99]
                transition-all duration-150
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
                flex-1 py-2 rounded-lg
                text-[12px] font-semibold text-white
                bg-amber-500
                hover:bg-amber-500/90
                active:bg-amber-600 active:scale-[0.99]
                shadow-[0_1px_3px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
                transition-all duration-150
              "
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function ShowCategories({ refreshSignal }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const { showToast } = useAdminToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/categories");
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || data.data || []);
      setError(null);
    } catch (e) {
      console.error("ShowCategories: Error fetching categories:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    window.addEventListener("focus", fetchCategories);
    return () => window.removeEventListener("focus", fetchCategories);
  }, [fetchCategories, refreshSignal]);

  const deleteCategory = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const res = await fetch(`http://localhost:8000/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("No se pudo eliminar la categoría", "error");
      return;
    }
    showToast("Categoría eliminada");
    fetchCategories();
  };

  const updateCategory = async (id, payload) => {
    const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      showToast("No se pudo actualizar la categoría", "error");
      return;
    }
    setEditing(null);
    showToast("Categoría actualizada");
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-stone-50/60 font-sans">
      {/* ── HEADER ── */}
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-stone-900 tracking-tight">
              Categorías
            </h1>
            {!loading && !error && (
              <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-2xl mx-auto px-5 pb-10 space-y-2">
        {/* Create form */}
        <CreateCategory onCreated={fetchCategories} />

        {/* Divider */}
        {!loading && categories.length > 0 && (
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-[0.08em]">
              {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
            </span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2 pt-1">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="
            flex items-start gap-2.5 px-3.5 py-3
            bg-red-50 border border-red-100 text-red-500
            rounded-xl text-[12px] font-medium
          ">
            <span className="text-[15px] leading-none mt-px">⚠️</span>
            <span>{error}</span>
          </div>
        ) : categories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1.5">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                index={i}
                onEdit={setEditing}
                onDelete={deleteCategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editing && (
        <EditModal
          category={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={(data) => updateCategory(editing.id, data)}
        />
      )}
    </div>
  );
}