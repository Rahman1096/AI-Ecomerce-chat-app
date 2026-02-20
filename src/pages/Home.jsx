import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineChatAlt2,
  HiArrowRight,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
} from "react-icons/hi";
import ProductCard from "../components/ProductCard";
import products from "../data/products";
import useScrollReveal from "../hooks/useScrollReveal";

/* ── Animated counter ── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame;
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

export default function Home() {
  const featured = products.filter((p) => p.rating >= 4.7).slice(0, 4);
  const newArrivals = products.slice(0, 8);
  const revealRef = useScrollReveal();

  return (
    <div className="min-h-screen" ref={revealRef}>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up visible">
              <div className="inline-flex items-center space-x-2 bg-brand-100/60 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-bounce-subtle">
                <HiOutlineSparkles className="w-4 h-4" />
                <span>AI-Powered Shopping</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
                Your Personal
                <span className="bg-gradient-to-r from-brand-600 via-purple-500 to-brand-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                  {" "}
                  AI Shopkeeper
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-lg">
                Don't just browse — talk to our AI Clerk. Ask for
                recommendations, negotiate prices, and shop entirely through
                conversation. The future of e-commerce is here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="btn-ripple inline-flex items-center space-x-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-all duration-300 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  <span>Shop Now</span>
                </Link>
                <button
                  onClick={() =>
                    document
                      .querySelector('[aria-label="Open AI Clerk chat"]')
                      ?.click()
                  }
                  className="inline-flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                  <span>Talk to Clerk</span>
                </button>
              </div>
            </div>

            {/* Hero Image Grid with float animation */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4 animate-float">
                <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] ring-1 ring-black/5">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
                    alt="Fashion"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8 animate-float-delayed">
                <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] ring-1 ring-black/5">
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop"
                    alt="Shopping"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated decorative blobs */}
        <div className="absolute top-20 -right-40 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-delay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      </section>

      {/* ═══ Trust Bar ═══ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                icon: HiOutlineTruck,
                text: "Free Shipping",
                sub: "On all orders",
              },
              {
                icon: HiOutlineShieldCheck,
                text: "Secure Checkout",
                sub: "100% protected",
              },
              {
                icon: HiOutlineRefresh,
                text: "Easy Returns",
                sub: "30-day returns",
              },
              {
                icon: HiOutlineChatAlt2,
                text: "AI Support",
                sub: "24/7 available",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="animate-fade-up flex items-center space-x-3 py-2"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-fade-up">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Shopping, Reimagined
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Our AI-powered platform transforms the way you discover and buy
              products.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                icon: HiOutlineChatAlt2,
                title: "Conversational Shopping",
                desc: "Just tell the Clerk what you need. No clicking, no browsing — pure conversation.",
                gradient: "from-blue-500 to-brand-600",
              },
              {
                icon: HiOutlineSparkles,
                title: "Smart Recommendations",
                desc: "Our AI understands context. Ask for a summer wedding outfit and get curated picks.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: HiOutlineShoppingBag,
                title: "Haggle for Deals",
                desc: "Negotiate prices with our Clerk. Birthday? Buying in bulk? Get exclusive discounts.",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-fade-up group relative text-center p-8 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aDZ2NmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 25, suffix: "+", label: "Products" },
              { value: 4200, suffix: "+", label: "Happy Customers" },
              { value: 98, suffix: "%", label: "Satisfaction Rate" },
              { value: 24, suffix: "/7", label: "AI Support" },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-up">
                <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-brand-200 text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Featured Products ═══ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 animate-fade-up">
            <div>
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
                Customer Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Top Rated
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 text-brand-600 font-medium hover:text-brand-700 text-sm group"
            >
              <span>View All</span>
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 stagger-children">
            {featured.map((product) => (
              <div key={product.id} className="animate-fade-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ New Arrivals ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 animate-fade-up">
            <div>
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
                Just Dropped
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 text-brand-600 font-medium hover:text-brand-700 text-sm group"
            >
              <span>Shop All</span>
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 stagger-children">
            {newArrivals.map((product) => (
              <div key={product.id} className="animate-fade-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="py-20 bg-gradient-to-br from-brand-700 via-brand-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative animate-fade-up">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ready to Shop Smarter?
          </h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto text-lg">
            Our AI Clerk is ready to help you find the perfect items, negotiate
            the best prices, and make your shopping experience truly personal.
          </p>
          <Link
            to="/products"
            className="btn-ripple inline-flex items-center space-x-2 bg-white text-brand-700 px-8 py-4 rounded-xl font-semibold hover:bg-brand-50 transition-all duration-300 shadow-2xl hover:-translate-y-0.5 animate-pulse-glow"
          >
            <span>Start Shopping</span>
            <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
