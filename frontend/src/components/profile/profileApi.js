const BASE_URL = "http://localhost:8000/api"

function getToken() {
  return localStorage.getItem("token")
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${getToken()}`,
  }
}

export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("No autorizado")
  return res.json()
}

export async function updateProfile(data) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "Error al guardar")
  return json
}

export async function updatePassword(data) {
  const res = await fetch(`${BASE_URL}/profile/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "Error al cambiar contraseña")
  return json
}