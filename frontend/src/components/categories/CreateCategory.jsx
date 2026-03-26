import { useState } from "react";

export default function CreateCategory() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    parent_id: null,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field, value) =>
    setForm({ ...form, [field]: value });

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
        const msg =
          data.message ||
          Object.values(data.errors || {})
            .flat()
            .join(", ");
        throw new Error(msg);
      }

      setMessage(`Categoría creada correctamente: ${data.name}`);
      setForm({ name: "", description: "", parent_id: null });

    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* TÍTULO */}
      <h1 className="text-2xl font-bold text-slate-800">
        Crear Nueva Categoría
      </h1>

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
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >

        {/* NOMBRE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Nombre de la categoría"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descripción
          </label>
          <textarea
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Descripción de la categoría..."
            rows="3"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* PADRE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Categoría Padre (opcional)
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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

        {/* BOTÓN */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg mt-4 bg-orange-600 hover:bg-orange-500 text-white font-medium transition"
        >
          Crear Categoría
        </button>
      </form>
    </div>
  );
}