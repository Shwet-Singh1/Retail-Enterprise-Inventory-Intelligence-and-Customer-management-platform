import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

// Category bars get a rotating set of colors from the site's own palette,
// rather than recharts' defaults, so the dashboard doesn't look bolted-on.
const CATEGORY_BAR_COLORS = ["#c98a1b", "#2f6f52", "#b23a2e", "#3b3654", "#a8710f", "#4b5d3a", "#8b4a62", "#6b6559"];

const ChartTooltip = ({ active, payload, label, prefix = "₹" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink text-white text-xs px-3 py-2 rounded-md font-mono shadow-lg">
      <div className="text-white/60 mb-0.5">{label}</div>
      <div className="font-semibold">
        {prefix}
        {payload[0].value.toFixed(2)}
      </div>
    </div>
  );
};

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
      <AdminNav />
      <div className="mb-6">
        <p className="font-mono text-xs text-brand-dark uppercase tracking-wider mb-1">Admin</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-line rounded-lg p-5">
          <p className="text-sm text-ink-muted">Total products</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-ink mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-5">
          <p className="text-sm text-ink-muted">Low stock items</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-brand-dark mt-1">{stats.lowStockCount}</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-5">
          <p className="text-sm text-ink-muted">Total orders</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-ink mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-5">
          <p className="text-sm text-ink-muted">Total revenue</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-pine mt-1">
            ₹{stats.totalRevenue.toFixed(0)}
          </p>
        </div>
        <Link
          to="/admin/listings"
          className="bg-white border border-line rounded-lg p-5 hover:border-brand transition-colors"
        >
          <p className="text-sm text-ink-muted">Listings to review</p>
          <p
            className={`font-mono text-2xl sm:text-3xl font-semibold mt-1 ${
              stats.pendingListingsCount > 0 ? "text-brand-dark" : "text-ink"
            }`}
          >
            {stats.pendingListingsCount}
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-line rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-1">Revenue, last 14 days</h2>
          <p className="text-xs text-ink-muted mb-4">Daily revenue, cancelled orders excluded</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.revenueByDay} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd2" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b6559" }}
                interval={2}
                axisLine={{ stroke: "#e4dfd2" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b6559" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#c98a1b"
                strokeWidth={2}
                dot={{ r: 3, fill: "#c98a1b" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-line rounded-lg p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-1">Revenue by category</h2>
          <p className="text-xs text-ink-muted mb-4">All-time, cancelled orders excluded</p>
          {stats.salesByCategory.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-ink-muted">
              No sales yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.salesByCategory} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd2" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b6559" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11, fill: "#1b1b1f" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#faf7f1" }} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {stats.salesByCategory.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_BAR_COLORS[index % CATEGORY_BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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
