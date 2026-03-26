import React from "react";

function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">

      <div className="text-5xl mb-4">🛒</div>

      <h2 className="text-2xl font-semibold text-gray-800">
        Tu carrito está vacío
      </h2>

      <p className="text-gray-500 mt-2">
        Añade productos para empezar
      </p>

      <button
        onClick={() => (window.location = "/")}
        className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
      >
        Ir a comprar
      </button>
    </div>
  );
}

export default CartEmpty;