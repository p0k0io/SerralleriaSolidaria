import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Por favor ingresa tu correo electrónico");
      return;
    }

    // Simulación de envío
    console.log("Recuperación de contraseña para:", email);
    setMessage(`Se ha enviado un enlace de recuperación a ${email}`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        
        <h2 className="text-3xl font-bold text-center mb-6">
          Recuperar Contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            className="w-full bg-slate-700 font-bold text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Enviar enlace
          </button>

          <div className="text-center mt-2">
            <a className="font-light text-sm text-blue-600 hover:underline" href="/login">
              Volver al login
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}