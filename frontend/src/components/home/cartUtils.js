import { CART_KEY } from "./constants"

export function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") } catch { return [] }
}

export function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}