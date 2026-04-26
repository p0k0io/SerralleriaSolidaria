import { API } from "./constants"

export async function getActiveProducts(params = {}) {
  try {
    const qs = new URLSearchParams()
    if (params.search)       qs.set("search", params.search)
    if (params.stock_status) qs.set("stock_status", params.stock_status)
    if (params.featured !== undefined) qs.set("featured", params.featured ? "1" : "0")

    const res = await fetch(`${API}/variants/active?${qs.toString()}`, {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener productos")
    const data = await res.json()
    if (Array.isArray(data)) {
      return data.reduce((acc, v) => {
        const key = v.product?.name ?? v.product_name ?? "Sin nombre"
        if (!acc[key]) acc[key] = []
        acc[key].push(v)
        return acc
      }, {})
    }
    return {}
  } catch (e) {
    console.error(e.message)
    return {}
  }
}

export async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API}/variants/active?featured=1`, {
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener productos destacados")
    const data = await res.json()
    return Array.isArray(data) ? data.filter((v) => v.featured && v.active) : []
  } catch (e) {
    console.error(e.message)
    return []
  }
}