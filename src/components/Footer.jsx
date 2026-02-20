import { Link } from "react-router-dom";
import { HiOutlineHeart, HiOutlineMail } from "react-icons/hi";
import useScrollReveal from "../hooks/useScrollReveal";

export default function Footer() {
  const revealRef = useScrollReveal();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto" ref={revealRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 animate-fade-up">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SV</span>
              </div>
              <span className="text-xl font-bold text-white">
                Style<span className="text-brand-400">Vault</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-6">
              Your AI-powered personal shopping destination. Discover curated
              fashion, accessories, and electronics with the help of our
              intelligent shopping assistant.
            </p>
            {/* Social-style icons */}
            <div className="flex space-x-3">
              {["Twitter", "GitHub", "Discord"].map((name) => (
                <span
                  key={name}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xs text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {name[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-up">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Shop All" },
                { to: "/cart", label: "Cart" },
                { to: "/checkout", label: "Checkout" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center space-x-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-400">
                      ›
                    </span>
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-fade-up">
            <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <HiOutlineMail className="w-4 h-4 text-brand-400" />
                <a
                  href="mailto:hello@stylevault.ai"
                  className="hover:text-white transition-colors"
                >
                  hello@stylevault.ai
                </a>
              </li>
            </ul>

            {/* Newsletter teaser */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">Stay updated</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center animate-fade-up">
          <p className="text-sm text-gray-500">
            &copy; 2026 StyleVault. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Made with</span>
            <HiOutlineHeart className="w-4 h-4 text-red-400 animate-pulse" />
            <span>and AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
