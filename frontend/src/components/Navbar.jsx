import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-ink text-white sticky top-0 z-10 border-b border-black/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to={isAdmin ? "/admin" : "/"}
          className="font-display text-lg font-semibold tracking-tight flex items-baseline gap-0.5"
        >
          Retail<span className="text-brand">Store</span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {isAdmin ? (
            // Admins get a minimal top bar. AdminNav (rendered on every /admin/*
            // page) already provides Dashboard / Products / Orders / Customers /
            // Listings navigation, so we don't duplicate it here.
            <Link to="/admin" className="hover:text-brand transition-colors">
              Admin
            </Link>
          ) : (
            <>
              <Link to="/" className="hover:text-brand transition-colors">
                Shop
              </Link>

              {user && (
                <Link to="/orders" className="hover:text-brand transition-colors">
                  My Orders
                </Link>
              )}

              {user && (
                <Link to="/sell" className="hover:text-brand transition-colors">
                  Sell
                </Link>
              )}

              {user && (
                <Link to="/cart" className="relative hover:text-brand transition-colors">
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-3.5 bg-brand text-ink font-mono text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white/50 hidden sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hover:text-brand transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand hover:bg-brand-dark text-ink font-medium px-3 py-1.5 rounded-md transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}