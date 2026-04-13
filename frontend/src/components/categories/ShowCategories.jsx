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
      setCategories(data.categories);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { getCategories(); }, [refresh]);

  async function deleteCategory(id) {
    if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Error al eliminar la categoría");

      setRefresh((p) => !p);

    } catch (e) {
      console.error(e.message);
    }
  }

  async function handleUpdateCategory(updatedData) {
    try {
      const res = await fetch(`http://localhost:8000/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      setRefresh((p) => !p);
      setEditingCategory(null);

    } catch (e) {
      console.error(e.message);
    }
  }

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-3">
      {categories.map((cat) => (
        <div key={cat.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
          <div>
            <h3 className="font-bold">{cat.name}</h3>
            <p className="text-sm text-gray-500">{cat.description}</p>
          </div>

          <ActionMenu
            onEdit={() => setEditingCategory(cat)}
            onDelete={() => deleteCategory(cat.id)}
          />
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

// ── Modal ─────────────────────────────────────────────────────────────────────
function EditCategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name, description });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="font-bold mb-4">Editar categoría</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-2 p-2 border"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full mb-4 p-2 border"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}