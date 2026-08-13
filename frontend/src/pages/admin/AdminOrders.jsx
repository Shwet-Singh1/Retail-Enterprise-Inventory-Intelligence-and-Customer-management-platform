import { useState, useEffect } from "react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

const STATUS_COLORS = {
  pending: "bg-brand-light text-brand-dark",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-pine-light text-pine",
  cancelled: "bg-brick-light text-brick",
};

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminNav />
      <div className="mb-6">
        <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Admin</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-line rounded-lg p-5">
            <p className="text-sm text-ink-muted">Total orders</p>
            <p className="font-mono text-3xl font-semibold text-ink mt-1">{orders.length}</p>
          </div>
          <div className="bg-white border border-line rounded-lg p-5">
            <p className="text-sm text-ink-muted">Total revenue (excl. cancelled)</p>
            <p className="font-mono text-3xl font-semibold text-ink mt-1">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setStatusFilter("")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === "" ? "bg-ink text-white border-ink" : "bg-white text-ink-muted border-line hover:bg-paper"
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                statusFilter === s ? "bg-ink text-white border-ink" : "bg-white text-ink-muted border-line hover:bg-paper"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center text-ink-muted py-16">Loading orders...</div>
      ) : error ? (
        <div className="text-brick text-sm">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-ink-muted py-16 border border-dashed border-line rounded-lg">
          No orders {statusFilter ? `with status "${statusFilter}"` : "yet"}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-line rounded-lg p-4">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-ink-muted font-mono">#{order._id.slice(-8)}</p>
                  <p className="text-sm text-ink mt-0.5">
                    {order.user?.name || "Unknown customer"}{" "}
                    <span className="text-ink-muted">({order.user?.email || "—"})</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} &middot;{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || "bg-paper text-ink-muted"}`}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs border border-line rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 border-t border-line pt-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-ink-muted">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-ink font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-line">
                <span className="text-sm text-ink-muted">Total</span>
                <span className="font-mono font-semibold text-ink">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
