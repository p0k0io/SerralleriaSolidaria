import { useState } from "react";

export default function CreateCategory() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    parent_id: null, // opcional, puedes asignar un ID de categoría padre
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Cambiar valores del formulario
  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Por favor completa el nombre de la categoría");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejar validación de Laravel
        const msg =
          data.message ||
          Object.values(data.errors || {})
            .flat()
            .join(", ");
        throw new Error(msg);
      }

      setMessage(`Categoría creada correctamente: ${data.name}`);

      // Limpiar formulario
      setForm({ name: "", description: "", parent_id: null });
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Crear Categoría
        </h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nombre de la categoría"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Descripción de la categoría"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">ID de Categoría Padre (opcional)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ID de la categoría padre"
              value={form.parent_id || ""}
              onChange={(e) =>
                handleChange(
                  "parent_id",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
            />
          </div>

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