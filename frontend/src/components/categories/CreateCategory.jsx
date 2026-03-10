import { useState } from "react";

export default function CreateCategory() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setMessage("Por favor completa el nombre de la categoría");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          description: description,
          parent_id: null, // opcional, puedes cambiar si quieres asignar padre
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la categoría");
      }

      const data = await res.json();
      console.log("Categoría creada:", data);
      setMessage("Categoría creada correctamente");

      // Limpiar formulario
      setName("");
      setDescription("");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Crear Categoría
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Descripción de la categoría"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            className="w-full bg-slate-700 font-bold text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Crear Categoría
          </button>
        </form>
      </div>
    </div>
  );
}