import { useState, useEffect } from "react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/listings/pending");
      setListings(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDecision = async (id, decision) => {
    setDecidingId(id);
    try {
      await api.put(`/products/listings/${id}/review`, { decision });
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not update listing");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminNav />
      <div className="mb-6">
        <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Admin</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Listings to review</h1>
        <p className="text-sm text-ink-muted mt-1">
          Products customers have submitted to sell. Approve to make them live in the shop, or reject to keep
          them out.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-ink-muted py-16">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center text-ink-muted py-16 border border-dashed border-line rounded-lg">
          No pending listings right now.
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l._id} className="bg-white border border-line rounded-lg p-4 flex gap-4">
              <div className="w-24 h-24 bg-paper rounded-md flex-shrink-0 overflow-hidden">
                {l.imageUrl ? (
                  <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted font-mono">
                    no image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <span className="font-mono text-[11px] text-brand-dark uppercase tracking-wider">
                      {l.category}
                    </span>
                    <h3 className="font-medium text-ink">{l.name}</h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Submitted by {l.submittedBy?.name || "Unknown"} ({l.submittedBy?.email || "—"})
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-ink">₹{l.price.toFixed(2)}</span>
                </div>

                {l.description && <p className="text-sm text-ink-muted mt-2 line-clamp-2">{l.description}</p>}

                <p className="text-xs text-ink-muted mt-2">Stock offered: {l.stock}</p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDecision(l._id, "approved")}
                    disabled={decidingId === l._id}
                    className="bg-pine hover:bg-pine/90 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(l._id, "rejected")}
                    disabled={decidingId === l._id}
                    className="bg-white hover:bg-paper disabled:opacity-50 text-brick text-xs font-medium px-3 py-1.5 rounded-md border border-line transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
