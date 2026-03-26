import React from "react";

function CartSummary({ cart, onCheckout }) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  return (
    <div className="sticky top-24 bg-white/90 backdrop-blur border border-gray-100 shadow-xl rounded-2xl p-6 space-y-4">

      <h2 className="text-lg font-semibold text-gray-800">
        Resumen
      </h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>

        <div className="flex justify-between text-gray-500">
          <span>Envío</span>
          <span>
            {shipping === 0 ? "Gratis" : `${shipping.toFixed(2)} €`}
          </span>
        </div>

        <div className="border-t pt-3 flex justify-between font-semibold text-gray-900 text-base">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
      >
        Finalizar compra
      </button>

      <p className="text-xs text-gray-400 text-center">
        Pago seguro • SSL cifrado
      </p>
    </div>
  );
}

export default CartSummary;