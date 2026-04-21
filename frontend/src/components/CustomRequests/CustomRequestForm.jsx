import { useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function CustomRequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "", // 👈 NEW
    description: ""
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(e) {
    setFile(e.target.files[0] || null);
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.description) {
      setMessage({ text: "Rellena todos los campos obligatorios.", type: "err" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone); // 👈 NEW
      fd.append("description", form.description);
      if (file) fd.append("image", file);

      const res = await fetch("http://localhost:8000/api/requests", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error();

      setMessage({
        text: "Solicitud enviada correctamente. Te contactaremos pronto.",
        type: "ok"
      });

      setForm({ name: "", email: "", phone: "", description: "" }); // 👈 NEW
      removeFile();

    } catch {
      setMessage({
        text: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        type: "err"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition mb-6"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a la tienda
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">
          Solicitud personalizada
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cuéntanos qué necesitas y te responderemos lo antes posible con una propuesta.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

        {/* Name + Email + PHONE (SOLO AÑADIDO, RESTO IGUAL) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          {/* 👇 SOLO AÑADIDO */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              placeholder="+34 600 000 000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

        </div>

        {/* Description (IGUAL) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            ¿Qué necesitas?
          </label>
          <textarea
            rows={4}
            placeholder="Describe el producto, la cantidad, las medidas u otros detalles relevantes…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none leading-relaxed"
          />
        </div>

        {/* FILE UPLOAD 👉 COMPLETAMENTE IGUAL QUE EL TUYO ORIGINAL */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Imagen de referencia{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </label>

          {!file ? (
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50 hover:border-orange-400 hover:bg-orange-50/50 transition cursor-pointer px-4 py-8 text-center">
              <svg className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>

              <span className="text-sm text-slate-500">
                Arrastra una imagen aquí o{" "}
                <span className="text-orange-500 font-semibold">
                  selecciona un archivo
                </span>
              </span>

              <span className="text-xs text-slate-400">
                PNG, JPG, WEBP — máx. 10 MB
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              <span className="text-sm text-slate-700 flex-1 truncate">
                {file.name}
              </span>

              <button
                onClick={removeFile}
                className="text-slate-400 hover:text-slate-700 transition p-0.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Submit (IGUAL) */}
        <div className="border-t border-slate-100 my-5" />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando…" : "Enviar solicitud"}
        </button>

        <p className="text-xs text-slate-400 text-center mt-2">
          Revisamos todas las solicitudes en menos de 24 horas laborables.
        </p>

        {/* Message (IGUAL) */}
        {message && (
          <div
            className={`flex items-center gap-2 mt-4 px-4 py-3 rounded-xl text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "ok" ? (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {message.text}
          </div>
        )}

      </div>
    </div>
  );
}