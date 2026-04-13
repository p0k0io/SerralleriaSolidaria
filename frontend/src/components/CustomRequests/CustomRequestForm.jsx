import { useState } from "react";

export default function CustomRequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al enviar");

      setMessage("✅ Solicitud enviada correctamente");
      setForm({ name: "", email: "", description: "" });
    } catch (err) {
      setMessage("❌ Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-3">

      <input
        placeholder="Nombre"
        className="p-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        placeholder="Email"
        type="email"
        className="p-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <textarea
        placeholder="¿Qué necesitas?"
        className="p-2 border rounded-xl focus:ring-2 focus:ring-orange-500 md:col-span-3"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />

      <button
        disabled={loading}
        className="bg-orange-500 text-white rounded-xl px-4 py-2 font-semibold hover:bg-orange-600 transition disabled:opacity-50 md:col-span-3"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>

      {message && (
        <p className="text-sm md:col-span-3 text-center text-slate-600">
          {message}
        </p>
      )}
    </form>
  );
}