import CartItem from "../../components/shoppingCart/CartItem";
import CartSummary from "../../components/shoppingCart/CartSummary";
import CartEmpty from "../../components/shoppingCart/CartEmpty";
import { useCart } from "../../components/shoppingCart/CartContext";

function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Tu carrito
      </h1>

      {cart.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>

          {/* Summary */}
          <CartSummary
            cart={cart}
            onCheckout={() => (window.location = "/checkout")}
          />

        </div>
      )}
    </div>
  );
}

export default CartPage;