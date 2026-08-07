import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    return <div className="text-center text-ink-muted py-16">Loading cart...</div>;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-2xl text-ink mb-2">Your cart is empty</p>
        <p className="text-ink-muted text-sm mb-6">Browse products and add something to get started.</p>
        <Link
          to="/"
          className="inline-block bg-ink hover:bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Your cart</h1>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.product._id}
            className="flex items-center gap-4 bg-white border border-line rounded-lg p-4"
          >
            <div className="w-16 h-16 bg-paper rounded-md flex-shrink-0 overflow-hidden">
              {item.product.imageUrl && (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-ink truncate">{item.product.name}</h3>
              <p className="text-sm text-ink-muted font-mono">₹{item.product.price.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                className="w-7 h-7 rounded-md border border-line text-ink-muted hover:bg-paper font-mono"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
                className="w-7 h-7 rounded-md border border-line text-ink-muted hover:bg-paper disabled:opacity-40 font-mono"
              >
                +
              </button>
            </div>

            <span className="font-mono font-semibold text-ink w-20 text-right">
              ₹{(item.product.price * item.quantity).toFixed(2)}
            </span>

            <button
              onClick={() => removeFromCart(item.product._id)}
              className="text-ink-muted hover:text-brick text-sm transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-line rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-ink-muted">Total</span>
          <span className="font-mono text-xl font-semibold text-ink">₹{cartTotal.toFixed(2)}</span>
        </div>

        {error && <div className="text-brick text-sm mb-3">{error}</div>}

        <button
          onClick={handleCheckout}
          disabled={placingOrder}
          className="w-full bg-brand hover:bg-brand-dark disabled:bg-line disabled:text-ink-muted text-ink font-semibold py-2.5 rounded-lg transition-colors"
        >
          {placingOrder ? "Placing order..." : "Checkout"}
        </button>
        <p className="text-xs text-ink-muted mt-2 text-center">
          Mock checkout — no real payment is processed.
        </p>
      </div>
    </div>
  );
}
