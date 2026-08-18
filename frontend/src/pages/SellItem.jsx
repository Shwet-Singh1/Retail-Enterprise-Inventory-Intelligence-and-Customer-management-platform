import { useState, useEffect } from "react";
import api from "../api/axios";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  imageUrl: "",
};

const STATUS_BADGE = {
  approved: "bg-pine-light text-pine",
  pending: "bg-brand-light text-brand-dark",
  rejected: "bg-brick-light text-brick",
};

const STATUS_MESSAGE = {
  approved: "Live in the shop",
  pending: "Waiting for admin review",
  rejected: "Not approved",
};

export default function SellItem() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/listings/mine");
      setListings(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      await api.post("/products/listings", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setForm(EMPTY_FORM);
      setSuccess(true);
      fetchMyListings();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    await api.delete(`/products/listings/${id}`);
    fetchMyListings();
  };

  const inputClass =
    "w-full bg-white border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Marketplace</p>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Sell an item</h1>
      <p className="text-sm text-ink-muted mb-8">
        Submit a product to sell on RetailStore. An admin reviews every listing before it goes live in the
        shop.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-line rounded-lg p-5 space-y-3 h-fit">
          <h2 className="font-display text-base font-semibold text-ink mb-1">New listing</h2>

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
            rows={3}
            className={inputClass}
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
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
            />
            <input
              required
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className={inputClass}
            />
          </div>
          <input
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className={inputClass}
          />

          {error && <p className="text-brick text-sm">{error}</p>}
          {success && <p className="text-pine text-sm">Submitted — waiting for admin review.</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink hover:bg-black disabled:bg-line disabled:text-ink-muted text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>

        <div className="lg:col-span-3">
          <h2 className="font-display text-base font-semibold text-ink mb-3">Your listings</h2>

          {loading ? (
            <p className="text-sm text-ink-muted">Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-ink-muted">You haven't submitted anything yet.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((l) => (
                <div key={l._id} className="bg-white border border-line rounded-lg p-4 flex items-center gap-3">
                  <div className="w-14 h-14 bg-paper rounded-md flex-shrink-0 overflow-hidden">
                    {l.imageUrl && <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{l.name}</p>
                    <p className="text-xs text-ink-muted">
                      ₹{l.price.toFixed(2)} &middot; {STATUS_MESSAGE[l.approvalStatus]}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[l.approvalStatus]}`}
                  >
                    {l.approvalStatus}
                  </span>
                  <button
                    onClick={() => handleDelete(l._id, l.name)}
                    className="text-xs text-ink-muted hover:text-brick transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
