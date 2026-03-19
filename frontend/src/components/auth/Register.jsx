import { useState } from "react"

export default function Register() {

  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("http://localhost:8000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, address, password, username })
        });

        const text = await response.text(); // <-- leer como texto primero

        let data;
        try {
          data = JSON.parse(text);          // intentar parsear JSON
        } catch (err) {
          console.error("Respuesta no es JSON:", text);
          setError("Error del servidor: respuesta inválida");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          setError(data.message || "Error al registrar");
          setLoading(false);
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setSuccess("Usuario registrado correctamente");

        setName("");
        setUsername("");
        setEmail("");
        setAddress("");
        setPassword("");
        setConfirmPassword("");

      } catch (err) {
        console.error(err);
        setError("Error del servidor");
      }

      setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">

        <h2 className="text-3xl font-bold text-center mb-6">
          Registro
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 mb-3 rounded">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">
              Nombre de usuario
            </label>

            <input
              type="text"
              name="username"
              placeholder="LucasSa"
              value={username}
              onChange={(e)=> setUsername(e.target.value)} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Nombre completo
            </label>

            <input
              type="text"
              name="fullName"
              placeholder="Lucas Sanchez Alava"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Dirección completa
            </label>

            <input
              type="text"
              name="address"
              placeholder="Calle Alfonso XII, 23 2-8"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Contraseña
            </label>

            <input
              type="password"
              name="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Repite Contraseña
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              ¿Ya tienes una cuenta?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 font-bold text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>

        </form>

      </div>
    </div>
  )
}