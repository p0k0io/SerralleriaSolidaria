import { useState } from "react";

export default function DeleteCategory({ categoryId, onDelete }) {
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al eliminar la categoría");
      }

      setMessage("Categoría eliminada correctamente");
      setTimeout(() => {
        onDelete(); // cerrar modal
      }, 1000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">Eliminar Categoría</h2>
        <p className="mb-4">¿Estás seguro de que deseas eliminar esta categoría?</p>

        {message && <p className="text-sm text-green-600 mb-2">{message}</p>}

        <div className="flex justify-center gap-2">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
          >
            Eliminar
          </button>
          <button
            onClick={onDelete}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}