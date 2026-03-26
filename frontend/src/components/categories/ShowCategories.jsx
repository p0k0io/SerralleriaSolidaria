import { useEffect, useState, useRef } from "react";

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// ── MenuItem ──────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, onClick, variant }) {
  const color =
    variant === "danger"
      ? "text-red-500 hover:bg-red-50"
      : "text-slate-700 hover:bg-slate-50";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition ${color}`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

// ── Menú de acciones ──────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShow((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-500 hover:text-slate-700"
        title="Opciones"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {show && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-30 overflow-hidden py-1">
          <MenuItem
            icon={<EditIcon />}
            label="Editar categoría"
            onClick={() => { onEdit(); setShow(false); }}
          />
          <div className="my-1 border-t border-slate-100" />
          <MenuItem
            icon={<TrashIcon />}
            label="Eliminar categoría"
            onClick={() => { onDelete(); setShow(false); }}
            variant="danger"
          />
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ShowCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  async function getCategories() {
    try {
      const res = await fetch("http://localhost:8000/api/categories", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Error al obtener categorías");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { getCategories(); }, [refresh]);

  async function deleteCategory(id) {
    if (!confirm("¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Error al eliminar la categoría");
      setRefresh((p) => !p);
    } catch (e) { console.error(e.message); }
  }

  async function handleUpdateCategory(updatedData) {
    try {
      const res = await fetch(`http://localhost:8000/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Error al actualizar la categoría");
      setRefresh((p) => !p);
      setEditingCategory(null);
    } catch (e) { console.error(e.message); }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span className="text-sm">Cargando categorías…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      ⚠ {error}
    </div>
  );

  if (categories.length === 0) return (
    <p className="p-6 text-slate-400 text-sm text-center">No hay categorías disponibles.</p>
  );

  return (
    <div className="p-6 space-y-3">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
        >
          <div className="flex items-center gap-4 p-4">
            {/* Indicador lateral */}
            <div className="w-2 h-10 rounded-full flex-shrink-0 bg-orange-500" />

            {/* Info principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-800 truncate">{cat.name}</h3>
                {cat.children?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
                    {cat.children.length} sub
                  </span>
                )}
              </div>
              {cat.description && (
                <p className="text-slate-500 text-sm truncate mt-0.5">{cat.description}</p>
              )}
              {cat.parent && (
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <FolderIcon />
                  en {cat.parent.name}
                </p>
              )}
            </div>

            {/* ID badge */}
            <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100 font-mono flex-shrink-0">
              #{cat.id}
            </span>

            {/* Menú */}
            <ActionMenu
              onEdit={() => setEditingCategory(cat)}
              onDelete={() => deleteCategory(cat.id)}
            />
          </div>
        </div>
      ))}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleUpdateCategory}
        />
      )}
    </div>
  );
}

// ── Modal de edición ──────────────────────────────────────────────────────────
function EditCategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { alert("El nombre es obligatorio"); return; }
    onSave({ name: name.trim(), description: description.trim() });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-orange-500 flex-shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Editar categoría</h2>
              <p className="text-slate-400 text-xs">{category.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nombre *</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
            <textarea
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition"
            >
              Guardar cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}