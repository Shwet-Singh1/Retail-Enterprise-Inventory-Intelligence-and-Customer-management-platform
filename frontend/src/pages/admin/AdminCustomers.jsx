import { useState, useEffect } from "react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Could not load customers."))
      .finally(() => setLoading(false));
  }, []);

  const totalCustomers = customers.filter((c) => c.role === "customer").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminNav />
      <div className="mb-6">
        <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Admin</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Customers</h1>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-line rounded-lg p-5">
            <p className="text-sm text-ink-muted">Registered customers</p>
            <p className="font-mono text-3xl font-semibold text-ink mt-1">{totalCustomers}</p>
          </div>
          <div className="bg-white border border-line rounded-lg p-5">
            <p className="text-sm text-ink-muted">Total revenue from customers</p>
            <p className="font-mono text-3xl font-semibold text-ink mt-1">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-ink-muted py-16">Loading customers...</div>
      ) : error ? (
        <div className="text-brick text-sm">{error}</div>
      ) : (
        <div className="bg-white border border-line rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-paper text-ink-muted text-left font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-t border-line hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        c.role === "admin" ? "bg-brand-light text-brand-dark" : "bg-paper text-ink-muted"
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">{c.orderCount}</td>
                  <td className="px-4 py-3 font-mono text-ink">₹{c.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="text-center text-ink-muted py-10 text-sm">No customers registered yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
