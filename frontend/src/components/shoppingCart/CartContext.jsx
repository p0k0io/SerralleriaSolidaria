import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

/* ───────── PROVIDER ───────── */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  /* ─── Persistencia ─── */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* ─── Añadir producto ─── */
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /* ─── Actualizar cantidad ─── */
  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  /* ─── Eliminar producto ─── */
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  /* ─── Vaciar carrito ─── */
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ───────── HOOK PERSONALIZADO ───────── */
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}