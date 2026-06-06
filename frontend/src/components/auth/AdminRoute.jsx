import { Navigate, Outlet } from "react-router-dom"

const TOKEN_KEY = "token"

export default function AdminRoute() {
  const token   = localStorage.getItem(TOKEN_KEY)
  const rawUser = localStorage.getItem("user")

  // Sin token → login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Sin datos de usuario → login
  if (!rawUser) {
    return <Navigate to="/login" replace />
  }

  let user = null
  try {
    user = JSON.parse(rawUser)
  } catch {
    return <Navigate to="/login" replace />
  }

  // Autenticado pero no es admin → home
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  // Todo OK → renderiza las rutas hijas
  return <Outlet />
}