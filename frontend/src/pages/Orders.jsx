import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  pending: "bg-brand-light text-brand-dark",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-pine-light text-pine",
  cancelled: "bg-brick-light text-brick",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/myorders")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-ink-muted py-16">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-2xl text-ink mb-2">No orders yet</p>
        <p className="text-ink-muted text-sm mb-6">Your order history will show up here.</p>
        <Link
          to="/"
          className="inline-block bg-ink hover:bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">My orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border border-line rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-ink-muted font-mono">#{order._id.slice(-8)}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-paper text-ink-muted"}`}
              >
                {order.status}
              </span>
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
    </div>
  );
}
