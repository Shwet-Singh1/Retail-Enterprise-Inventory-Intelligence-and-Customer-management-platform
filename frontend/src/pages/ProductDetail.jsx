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
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-brand text-sm font-medium hover:underline">
          &larr; Back to shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 inline-block mb-6">
        &larr; Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-sm">No image</span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-brand font-medium uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{product.name}</h1>

          {product.sku && <p className="text-xs text-slate-400 mt-1">SKU: {product.sku}</p>}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">₹{product.price.toFixed(2)}</span>
            {isOutOfStock ? (
              <span className="text-sm text-red-600 font-medium">Out of stock</span>
            ) : isLowStock ? (
              <span className="text-sm text-amber-600 font-medium">Only {product.stock} left</span>
            ) : (
              <span className="text-sm text-slate-500">In stock ({product.stock} available)</span>
            )}
          </div>

          {product.description && (
            <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>
          )}

          {user ? (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg"
                >
                  −
                </button>
                <span className="px-4 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock || adding}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {isOutOfStock ? "Unavailable" : added ? "Added ✓" : adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="mt-6 block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Login to buy
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
