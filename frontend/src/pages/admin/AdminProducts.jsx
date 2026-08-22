import { useState, useEffect } from "react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  lowStockThreshold: "10",
  imageUrl: "",
  sku: "",
};

const inputClass =
  "w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand";

const STATUS_BADGE = {
  approved: "bg-pine-light text-pine",
  pending: "bg-brand-light text-brand-dark",
  rejected: "bg-brick-light text-brick",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [adjustingId, setAdjustingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError("");
    try {
      // Admin sees every product regardless of approval status - including
      // its own catalog and any customer-submitted listings
      const res = await api.get("/products/admin/all");
      setProducts(res.data);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      imageUrl: product.imageUrl || "",
      sku: product.sku || "",
    });
    setEditingId(product._id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const stock = Number(form.stock);
    const lowStockThreshold = form.lowStockThreshold === "" ? 10 : Number(form.lowStockThreshold);

    if (Number.isNaN(price) || price < 0) {
      setError("Price must be a number of 0 or more.");
      return;
    }
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      setError("Stock must be a whole number of 0 or more.");
      return;
    }
    if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      setError("Low stock threshold must be a number of 0 or more.");
      return;
    }

    setSaving(true);
    const payload = { ...form, price, stock, lowStockThreshold };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  // Quick +/- stock adjust, right in the table - no need to open the full
  // edit modal just to bump stock up after a restock delivery.
  const adjustStock = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    setAdjustingId(product._id);
    setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, stock: newStock } : p)));
    try {
      await api.put(`/products/${product._id}`, { stock: newStock });
    } catch (err) {
      // Roll back on failure
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, stock: product.stock } : p)));
      alert(err.response?.data?.message || "Could not update stock");
    } finally {
      setAdjustingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminNav />
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Admin</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Manage products</h1>
        </div>
        <button
          onClick={openAddForm}
          className="bg-brand hover:bg-brand-dark text-ink font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Add product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-20">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-line">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              {editingId ? "Edit product" : "Add product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                rows={2}
              />
              <input
                required
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={inputClass}
                />
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className={inputClass}
                />
              </div>
              <input
                type="number"
                min="0"
                placeholder="Low stock threshold (default 10)"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Image URL (optional)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="SKU (optional)"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={inputClass}
              />

              {error && <div className="text-brick text-sm">{error}</div>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-line text-ink text-sm font-medium py-2 rounded-lg hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-ink hover:bg-black disabled:bg-line disabled:text-ink-muted text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-ink-muted py-16">Loading products...</div>
      ) : loadError ? (
        <div className="text-center py-16 border border-dashed border-line rounded-lg">
          <p className="text-brick text-sm mb-3">{loadError}</p>
          <button
            onClick={fetchProducts}
            className="text-sm font-medium text-brand-dark hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-paper text-ink-muted text-left font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-line hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">
                    {p.name}
                    {p.submittedBy && (
                      <div className="text-xs text-ink-muted font-normal mt-0.5">
                        Listed by {p.submittedBy.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                  <td className="px-4 py-3 text-ink font-mono">₹{p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjustStock(p, -1)}
                        disabled={adjustingId === p._id || p.stock <= 0}
                        className="w-6 h-6 rounded border border-line text-ink-muted hover:bg-paper disabled:opacity-30 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className={p.stock <= p.lowStockThreshold ? "text-brand-dark font-medium w-6 text-center" : "text-ink-muted w-6 text-center"}>
                        {p.stock}
                      </span>
                      <button
                        onClick={() => adjustStock(p, 1)}
                        disabled={adjustingId === p._id}
                        className="w-6 h-6 rounded border border-line text-ink-muted hover:bg-paper disabled:opacity-30 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[p.approvalStatus] || "bg-paper text-ink-muted"}`}
                    >
                      {p.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => openEditForm(p)} className="text-brand-dark hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      disabled={deletingId === p._id}
                      className="text-brick hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingId === p._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center text-ink-muted py-10 text-sm">No products yet. Add one to get started.</div>
          )}
        </div>
      )}
    </div>
  );
}
