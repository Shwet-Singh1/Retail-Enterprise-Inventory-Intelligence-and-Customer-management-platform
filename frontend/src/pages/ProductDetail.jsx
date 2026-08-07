import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/products/${id}`);
        if (!cancelled) {
          setProduct(res.data);
          setQuantity(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "Product not found."
              : "Could not load this product. Is the backend running?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-line/50 rounded-lg" />
          <div className="space-y-3">
            <div className="h-3 w-20 bg-line/50 rounded" />
            <div className="h-7 w-3/4 bg-line/50 rounded" />
            <div className="h-6 w-32 bg-line/50 rounded" />
            <div className="h-20 w-full bg-line/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="font-display text-lg text-ink mb-2">Couldn't load this product</p>
        <p className="text-brick text-sm mb-4">{error}</p>
        <Link to="/" className="text-brand-dark text-sm font-medium hover:underline">
          &larr; Back to shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-ink-muted hover:text-ink inline-block mb-6 transition-colors">
        &larr; Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-white border border-line rounded-lg flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-ink-muted text-sm font-mono">no image</span>
          )}

          {(isOutOfStock || isLowStock) && (
            <span
              className={`stamp absolute top-3 right-3 bg-white/90 ${
                isOutOfStock ? "text-brick" : "text-brand-dark"
              }`}
            >
              {isOutOfStock ? "Sold out" : "Low stock"}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-xs text-brand-dark uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="font-display text-3xl font-semibold text-ink mt-2">{product.name}</h1>

          {product.sku && (
            <p className="font-mono text-xs text-ink-muted mt-2">SKU {product.sku}</p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <span className="font-mono text-3xl font-semibold text-ink">₹{product.price.toFixed(2)}</span>
            {isOutOfStock ? (
              <span className="text-sm text-brick font-medium">Out of stock</span>
            ) : isLowStock ? (
              <span className="text-sm text-brand-dark font-medium">Only {product.stock} left</span>
            ) : (
              <span className="text-sm text-pine font-medium">In stock &middot; {product.stock} available</span>
            )}
          </div>

          {product.description && (
            <p className="text-ink-muted mt-5 leading-relaxed">{product.description}</p>
          )}

          {user ? (
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center border border-line rounded-lg bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-ink-muted hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg font-mono"
                >
                  −
                </button>
                <span className="px-4 text-sm font-mono font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-ink-muted hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg font-mono"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock || adding}
                className="flex-1 bg-ink hover:bg-black disabled:bg-line disabled:text-ink-muted disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {isOutOfStock ? "Unavailable" : added ? "Added ✓" : adding ? "Adding..." : "Add to cart"}
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="mt-8 block text-center bg-paper hover:bg-line border border-line text-ink text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Login to buy
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
