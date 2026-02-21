import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineUser,
} from "react-icons/hi";

export default function Navbar() {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const count = getCartCount();
  const location = useLocation();
  const navigate = useNavigate();

  /* Track scroll for shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Bounce cart badge when count changes */
  useEffect(() => {
    if (count > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
  }, [count]);

  /* Close mobile nav on route change */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/");
  };

  const getInitials = () => {
    if (!user) return "";
    if (user.displayName) return user.displayName.charAt(0).toUpperCase();
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative text-sm font-medium transition-colors duration-200 py-1 ${
          active ? "text-brand-600" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {label}
        {active && (
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-600 rounded-full animate-scale-in" />
        )}
      </Link>
    );
  };

  return (
    <nav
      className={`bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-gray-200 shadow-lg shadow-black/[0.03]"
          : "border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-600/20">
              <span className="text-white font-bold text-sm">SV</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Style<span className="text-brand-600">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLink("/", "Home")}
            {navLink("/products", "Shop")}

            <Link to="/cart" className="relative group">
              <HiOutlineShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
              {count > 0 && (
                <span
                  className={`absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                    cartBounce ? "animate-bounce-subtle" : ""
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 pl-4 border-l border-gray-200"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100 hover:ring-brand-300 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold ring-2 ring-brand-100 hover:ring-brand-300 transition-all">
                      {getInitials()}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 pl-4 border-l border-gray-200 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
              >
                <HiOutlineUser className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <HiOutlineShoppingBag className="w-6 h-6 text-gray-600" />
              {count > 0 && (
                <span
                  className={`absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                    cartBounce ? "animate-bounce-subtle" : ""
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {mobileOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav with slide animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out-expo ${
            mobileOpen ? "max-h-72 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-100 pt-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 px-3 rounded-lg font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 px-3 rounded-lg font-medium transition-colors ${
                location.pathname === "/products"
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Shop
            </Link>

            {/* Mobile Auth */}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex-shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center space-x-2 py-2.5 px-3 rounded-lg font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <HiOutlineUser className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
