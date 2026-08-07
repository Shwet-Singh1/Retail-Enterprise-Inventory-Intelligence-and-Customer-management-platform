import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link to={`/products/${product._id}`} className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 text-sm">No image</span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-brand font-medium uppercase tracking-wide">
          {product.category}
        </span>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2 hover:text-brand transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">₹{product.price.toFixed(2)}</span>
          {isOutOfStock ? (
            <span className="text-xs text-red-600 font-medium">Out of stock</span>
          ) : isLowStock ? (
            <span className="text-xs text-amber-600 font-medium">Only {product.stock} left</span>
          ) : (
            <span className="text-xs text-slate-500">In stock</span>
          )}
        </div>

        {user ? (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className="mt-3 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {isOutOfStock ? "Unavailable" : added ? "Added ✓" : adding ? "Adding..." : "Add to Cart"}
          </button>
        ) : (
          <a
            href="/login"
            className="mt-3 w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Login to buy
          </a>
        )}
      </div>
    </div>
  );
}
