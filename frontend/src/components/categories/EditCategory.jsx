import { useState, useEffect } from "react";

export default function EditCategory({ categoryId, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`http://localhost:8000/api/categories/${categoryId}`);
        if (!res.ok) throw new Error("Error al cargar la categoría");

        const data = await res.json();
        setName(data.name);
        setDescription(data.description || "");

      } catch (err) {
        setError(err.message);
      }
    }

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar la categoría");
      }

      setMessage("Categoría actualizada correctamente");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">

        {/* TÍTULO */}
        <h2 className="text-2xl font-bold text-slate-800 text-center">
          Editar Categoría
        </h2>

        {/* MENSAJES */}
        {(message || error) && (
          <div className={`text-center p-3 rounded border ${
            message
              ? "bg-green-100 text-green-700 border-green-400"
              : "bg-red-100 text-red-700 border-red-400"
          }`}>
            {message || error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-500 transition font-medium"
            >
              Guardar cambios
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}