import { useState } from "react";

export default function DeleteCategory({ categoryId, onDelete }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar la categoría");
      }

      setMessage("Categoría eliminada correctamente");

      setTimeout(() => {
        onDelete(); // cerrar modal
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

      <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-4 text-center">

        {/* TÍTULO */}
        <h2 className="text-xl font-bold text-slate-800">
          Eliminar Categoría
        </h2>

        {/* TEXTO */}
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar esta categoría?
          <br />
          <span className="text-red-500 font-medium">
            Esta acción no se puede deshacer.
          </span>
        </p>

        {/* MENSAJES */}
        {(message || error) && (
          <div className={`p-3 rounded border text-sm ${
            message
              ? "bg-green-100 text-green-700 border-green-400"
              : "bg-red-100 text-red-700 border-red-400"
          }`}>
            {message || error}
          </div>
        )}

        {/* BOTONES */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>

          <button
            onClick={onDelete}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-200 transition font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}