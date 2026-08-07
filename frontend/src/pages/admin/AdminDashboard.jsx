import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products/dashboard/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-ink-muted py-16">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Admin</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        </div>
        <Link
          to="/admin/products"
          className="bg-ink hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Manage products
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-line rounded-lg p-5">
          <p className="text-sm text-ink-muted">Total products</p>
          <p className="font-mono text-3xl font-semibold text-ink mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-5">
          <p className="text-sm text-ink-muted">Low stock items</p>
          <p className="font-mono text-3xl font-semibold text-brand-dark mt-1">{stats.lowStockCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-line rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-3 flex items-center gap-2">
            <span className="stamp text-brand-dark text-[0.6rem]">low stock</span>
          </h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink-muted">All products are well stocked.</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex justify-between text-sm py-1.5 border-b border-line last:border-0">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-mono text-brand-dark font-medium">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-line rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-3 flex items-center gap-2">
            <span className="stamp text-pine text-[0.6rem]">top selling</span>
          </h2>
          {stats.topSelling.length === 0 ? (
            <p className="text-sm text-ink-muted">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.topSelling.map((p) => (
                <div key={p._id} className="flex justify-between text-sm py-1.5 border-b border-line last:border-0">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-mono text-ink-muted">{p.unitsSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
