import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, refreshCart, loading } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setError("");
    setPlacingOrder(true);
    try {
      await api.post("/orders");
      await refreshCart();
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-500 py-16">Loading cart...</div>;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 text-sm">Browse products and add something to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Your Cart</h1>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.product._id}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-md flex-shrink-0 overflow-hidden">
              {item.product.imageUrl && (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 truncate">{item.product.name}</h3>
              <p className="text-sm text-slate-500">₹{item.product.price.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
                className="w-7 h-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                +
              </button>
            </div>

            <span className="font-semibold text-slate-900 w-20 text-right">
              ₹{(item.product.price * item.quantity).toFixed(2)}
            </span>

            <button
              onClick={() => removeFromCart(item.product._id)}
              className="text-slate-400 hover:text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-600">Total</span>
          <span className="text-xl font-bold text-slate-900">₹{cartTotal.toFixed(2)}</span>
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <button
          onClick={handleCheckout}
          disabled={placingOrder}
          className="w-full bg-brand hover:bg-brand-dark disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {placingOrder ? "Placing order..." : "Checkout"}
        </button>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Mock checkout — no real payment is processed.
        </p>
      </div>
    </div>
  );
}
