import { Link } from "react-router-dom";
import { HiOutlineHeart, HiOutlineMail } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SV</span>
              </div>
              <span className="text-xl font-bold text-white">
                Style<span className="text-brand-400">Vault</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Your AI-powered personal shopping destination. Discover curated
              fashion, accessories, and electronics with the help of our
              intelligent shopping assistant.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <HiOutlineMail className="w-4 h-4" />
                <span>hello@stylevault.ai</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 StyleVault. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Made with</span>
            <HiOutlineHeart className="w-4 h-4 text-red-400" />
            <span>and AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
