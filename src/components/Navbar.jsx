import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import {
  HiOutlineShoppingBag,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";

export default function Navbar() {
  const { getCartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = getCartCount();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SV</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Style<span className="text-brand-600">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              Shop
            </Link>
            <Link to="/cart" className="relative group">
              <HiOutlineShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
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
                <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-600"
            >
              {mobileOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Shop
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
