import { useState, useEffect } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get("/products", { params });
      setProducts(res.data);

      // Build category list from full result set only on first unfiltered load
      if (!category && !search) {
        const uniqueCategories = [...new Set(res.data.map((p) => p.category))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError("Could not load products. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300); // debounce search
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-2">
        <div>
          <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">
            {products.length > 0 && !loading ? `${products.length} items` : "Catalog"}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">Shop</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-brick text-sm mb-4">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-line overflow-hidden animate-pulse">
              <div className="aspect-square bg-line/60" />
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-16 bg-line/60 rounded" />
                <div className="h-3.5 w-full bg-line/60 rounded" />
                <div className="h-8 w-full bg-line/40 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-line rounded-lg">
          <p className="font-display text-lg text-ink mb-1">Nothing here yet</p>
          <p className="text-ink-muted text-sm">
            {search
              ? `No products match "${search}".`
              : "No products in the catalog yet — check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
