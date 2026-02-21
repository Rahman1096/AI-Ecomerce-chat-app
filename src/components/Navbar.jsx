import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import {
  HiOutlineShoppingBag,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";

export default function Navbar() {
  const { getCartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const count = getCartCount();
  const location = useLocation();

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
  useEffect(() => setMobileOpen(false), [location]);

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
          <div className="hidden md:flex items-center space-x-8">
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
            mobileOpen ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"
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
          </div>
        </div>
      </div>
    </nav>
  );
}
