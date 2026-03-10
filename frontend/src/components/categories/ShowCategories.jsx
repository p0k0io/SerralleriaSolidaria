import { useEffect, useState } from "react";

export function ShowCategories({ onEdit, onDelete }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getCategories() {
    try {
      const res = await fetch("http://localhost:8000/api/categories");
      if (!res.ok) throw new Error("Error al obtener categorías");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-4">
      {categories.length === 0 && <p>No hay categorías</p>}
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="flex justify-between items-center bg-white p-3 rounded shadow"
        >
          <div>
            <h3 className="font-semibold">{cat.name}</h3>
            <p className="text-sm text-gray-600">{cat.description}</p>
            <p className="text-xs text-gray-400">
              Padre: {cat.parent ? cat.parent.name : "Ninguno"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(cat.id)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}