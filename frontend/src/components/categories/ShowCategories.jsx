import { useEffect, useState, useCallback } from "react";
import CreateCategory from "./CreateCategory";

// ── ICONOS ────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── BADGE DE SUBCATEGORÍA ────────────────────────────────────────────────────
function ParentBadge({ name }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-50 text-amber-600 border border-amber-200">
      <FolderIcon />
      {name}
    </span>
  );
}

// ── MENÚ CONTEXTUAL ───────────────────────────────────────────────────────────
function MenuItem({ icon, label, onClick, variant }) {
  const base = "w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 rounded-lg";
  const color = variant === "danger"
    ? "text-red-500 hover:bg-red-50"
    : "text-stone-700 hover:bg-stone-100";

  return (
    <button onClick={onClick} className={`${base} ${color}`}>
      <span className="opacity-70">{icon}</span>
      {label}
    </button>
  );
}

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
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 
          text-stone-400 hover:text-stone-700 hover:bg-stone-100
          ${show ? "bg-stone-100 text-stone-700" : ""}`}
      >
        <DotsIcon />
      </button>

      {show && (
        <div
          className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-stone-100 z-30 p-1.5"
          style={{
            boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.06)",
          }}
        >
          <MenuItem
            icon={<EditIcon />}
            label="Editar"
            onClick={() => { onEdit(); setShow(false); }}
          />
          <div className="my-1 mx-2 border-t border-stone-100" />
          <MenuItem
            icon={<TrashIcon />}
            label="Eliminar"
            variant="danger"
            onClick={() => { onDelete(); setShow(false); }}
          />
        </div>
      )}
    </div>
  );
}

// ── TARJETA DE CATEGORÍA ─────────────────────────────────────────────────────
function CategoryCard({ cat, onEdit, onDelete, index }) {
  return (
    <div
      className="group bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4 
        transition-all duration-200 hover:shadow-md hover:border-stone-200 hover:-translate-y-0.5"
      style={{
        animationDelay: `${index * 60}ms`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Accent strip */}
      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 flex-shrink-0" />

      {/* Avatar inicial */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-amber-700 leading-none">
          {cat.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 text-sm truncate leading-snug">{cat.name}</p>
        {cat.description && (
          <p className="text-xs text-stone-400 mt-0.5 truncate">{cat.description}</p>
        )}
        {cat.parent && (
          <div className="mt-1.5">
            <ParentBadge name={cat.parent.name} />
          </div>
        )}
      </div>

      {/* Acción */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <ActionMenu onEdit={() => onEdit(cat)} onDelete={() => onDelete(cat.id)} />
      </div>
    </div>
  );
}

// ── SKELETON LOADER ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4 animate-pulse"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="w-1 h-10 rounded-full bg-stone-100" />
      <div className="w-9 h-9 rounded-xl bg-stone-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-stone-100 rounded-full w-2/5" />
        <div className="h-2.5 bg-stone-50 rounded-full w-3/5" />
      </div>
    </div>
  );
}

// ── ESTADO VACÍO ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
        <FolderIcon />
      </div>
      <p className="text-stone-700 font-semibold text-sm">Sin categorías</p>
      <p className="text-stone-400 text-xs mt-1">Crea tu primera categoría para empezar</p>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function ShowCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

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
  }, [fetchCategories]);

  const deleteCategory = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await fetch(`http://localhost:8000/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const updateCategory = async (id, payload) => {
    await fetch(`http://localhost:8000/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditing(null);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-baseline gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 mb-0.5" />
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Categorías</h1>
            {!loading && !error && (
              <p className="text-xs text-stone-400 mt-0.5">
                {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
              </p>
            )}
          </div>

          <ActionMenu
            onEdit={() => setEditing(null)}
            onDelete={() => {}}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-10 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm">
            <span className="text-base">⚠️</span>
            {error}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState />
        ) : (
          categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={i}
              onEdit={setEditing}
              onDelete={deleteCategory}
            />
          ))
        )}
      </div>

      {/* Modal */}
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

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 focus:bg-white transition-all duration-150";

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

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <EditIcon />
            </div>
            <p className="font-bold text-stone-900 text-sm">Editar categoría</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors duration-150"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-5 py-5 space-y-4">
          <Field label="Nombre">
            <input
              className={inputClass}
              value={name}
              placeholder="Nombre de la categoría"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>

          <Field label="Descripción">
            <textarea
              className={`${inputClass} resize-none h-20`}
              value={description}
              placeholder="Descripción opcional…"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Categoría padre">
            <select
              className={inputClass}
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
          </Field>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 
                hover:bg-stone-50 hover:border-stone-300 transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white 
                bg-gradient-to-b from-amber-500 to-orange-500
                hover:from-amber-400 hover:to-orange-400
                active:from-amber-600 active:to-orange-600
                shadow-sm shadow-orange-200 transition-all duration-150"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
