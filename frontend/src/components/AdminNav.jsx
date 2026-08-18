import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/axios";

const tabs = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/listings", label: "Listings" },
];

export default function AdminNav() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api
      .get("/products/listings/pending")
      .then((res) => setPendingCount(res.data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex gap-1 border-b border-line mb-6 -mt-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              isActive
                ? "border-brand text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            }`
          }
        >
          {tab.label}
          {tab.to === "/admin/listings" && pendingCount > 0 && (
            <span className="bg-brand text-ink font-mono text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
