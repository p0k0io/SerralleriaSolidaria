import React from "react";

function CartItem({ item, updateQuantity, removeItem }) {
  return (
    <div className="group flex items-center gap-4 bg-white/80 backdrop-blur border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition">

      {/* Imagen */}
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-xl"
      />

      {/* Info */}
      <div className="flex-1">
        <h2 className="font-semibold text-gray-800">{item.name}</h2>
        <p className="text-sm text-gray-500">{item.price.toFixed(2)} €</p>
      </div>

      {/* Cantidad */}
      <div className="flex items-center border rounded-xl overflow-hidden">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="px-3 py-1 hover:bg-gray-100"
        >
          −
        </button>

        <span className="px-3 text-sm">{item.quantity}</span>

        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="px-3 py-1 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Total item */}
      <div className="w-20 text-right font-medium text-gray-800">
        {(item.price * item.quantity).toFixed(2)} €
      </div>

      {/* Delete */}
      <button
        onClick={() => removeItem(item.id)}
        className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500"
      >
        ✕
      </button>
    </div>
  );
}

export default CartItem;