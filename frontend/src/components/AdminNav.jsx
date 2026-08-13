import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
];

export default function AdminNav() {
  return (
    <div className="flex gap-1 border-b border-line mb-6 -mt-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-brand text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
