import { useState } from "react"
import { Link } from "react-router-dom"

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
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          address,
          password,
          username
        })
      })

      const text = await response.text()

      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError("Error del servidor: respuesta inválida")
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError(data.message || "Error al registrar")
        setLoading(false)
        return
      }

      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      setSuccess("Usuario registrado correctamente")

      setName("")
      setUsername("")
      setEmail("")
      setAddress("")
      setPassword("")
      setConfirmPassword("")

    } catch {
      setError("Error del servidor")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        <div className="bg-white border border-orange-100 shadow-sm rounded-2xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-orange-500 px-8 py-6">
            <h2 className="text-white text-2xl font-bold">Crear cuenta</h2>
            <p className="text-orange-100 text-sm mt-1">
              Regístrate para empezar
            </p>
          </div>

          <div className="px-8 py-7 space-y-5">

            {/* ERROR */}
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div role="status" className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* USERNAME */}
              <div className="space-y-1.5">
                <label htmlFor="register-username" className="text-sm text-slate-600">Usuario</label>
                <input
                  id="register-username"
                  type="text"
                  placeholder="LucasSa"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {/* NAME */}
              <div className="space-y-1.5">
                <label htmlFor="register-name" className="text-sm text-slate-600">Nombre completo</label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Lucas Sanchez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label htmlFor="register-email" className="text-sm text-slate-600">Correo</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {/* ADDRESS + BUTTON */}
              <div className="space-y-1.5">
                <label htmlFor="register-address" className="text-sm text-slate-600">Dirección</label>

                <div className="flex gap-2">
                  <input
                    id="register-address"
                    type="text"
                    placeholder="Calle Alfonso XII, 23"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setAddress("Sin especificar")}
                    className="whitespace-nowrap px-3 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Prefiero decirlo después
                  </button>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <label htmlFor="register-password" className="text-sm text-slate-600">Contraseña</label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {/* CONFIRM */}
              <div className="space-y-1.5">
                <label htmlFor="register-confirm-password" className="text-sm text-slate-600">Repetir contraseña</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                  required
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition disabled:bg-orange-300"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>

            {/* LOGIN LINK */}
            <p className="text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="text-orange-500 font-semibold hover:text-orange-600"
              >
                Inicia sesión
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}