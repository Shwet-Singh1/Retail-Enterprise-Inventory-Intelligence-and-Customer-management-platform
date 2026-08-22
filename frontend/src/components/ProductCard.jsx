import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [imgError, setImgError] = useState(false);

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
    <div className="group bg-white rounded-lg border border-line overflow-hidden flex flex-col hover:shadow-[0_4px_0_0_rgba(27,27,31,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      <Link to={`/products/${product._id}`} className="relative aspect-square bg-paper flex items-center justify-center overflow-hidden">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-ink-muted text-sm font-mono">no image</span>
        )}

        {(isOutOfStock || isLowStock) && (
          <span
            className={`stamp absolute top-2 right-2 bg-white/90 ${
              isOutOfStock ? "text-brick" : "text-brand-dark"
            }`}
          >
            {isOutOfStock ? "Sold out" : "Low stock"}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider">
          {product.category}
        </span>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium text-ink mt-1 line-clamp-2 group-hover:text-brand-dark transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-lg font-semibold text-ink">₹{product.price.toFixed(2)}</span>
          {!isOutOfStock && !isLowStock && (
            <span className="text-xs text-pine font-medium">In stock</span>
          )}
        </div>

        {user ? (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className="mt-3 w-full bg-ink hover:bg-black disabled:bg-line disabled:text-ink-muted disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-md transition-colors"
          >
            {isOutOfStock ? "Unavailable" : added ? "Added ✓" : adding ? "Adding..." : "Add to cart"}
          </button>
        ) : (
          <a
            href="/login"
            className="mt-3 w-full block text-center bg-paper hover:bg-line text-ink text-sm font-medium py-2 rounded-md transition-colors border border-line"
          >
            Login to buy
          </a>
        )}
      </div>
    </div>
  );
}
