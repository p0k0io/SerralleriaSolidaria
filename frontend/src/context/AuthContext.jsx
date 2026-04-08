
import { createContext, useContext, useState, useEffect } from "react"

const TOKEN_KEY = "token"
const API_BASE  = "http://localhost:8000/api"


const AuthContext = createContext(null)


export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    fetch(`${API_BASE}/user`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido")
        return res.json()
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])


  function login(token, userData) {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(userData)
  }

 
  function logout() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  function authFetch(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY)
    return fetch(url, {
      ...options,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Hook — úsalo en cualquier componente ── */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}