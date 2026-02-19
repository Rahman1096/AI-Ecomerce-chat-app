import { Link } from "react-router-dom";
import {
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineChatAlt2,
  HiArrowRight,
} from "react-icons/hi";
import ProductCard from "../components/ProductCard";
import products from "../data/products";

export default function Home() {
  const featured = products.filter((p) => p.rating >= 4.7).slice(0, 4);
  const newArrivals = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-brand-100/60 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <HiOutlineSparkles className="w-4 h-4" />
                <span>AI-Powered Shopping</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
                Your Personal
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
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
                  className="inline-flex items-center space-x-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
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
                  className="inline-flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                  <span>Talk to Clerk</span>
                </button>
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
                    alt="Fashion"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop"
                    alt="Shopping"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-20 -right-40 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: HiOutlineChatAlt2,
                title: "Conversational Shopping",
                desc: "Just tell the Clerk what you need. No clicking, no browsing — pure conversation.",
              },
              {
                icon: HiOutlineSparkles,
                title: "Smart Recommendations",
                desc: "Our AI understands context. Ask for a summer wedding outfit and get curated picks.",
              },
              {
                icon: HiOutlineShoppingBag,
                title: "Haggle for Deals",
                desc: "Negotiate prices with our Clerk. Birthday? Buying in bulk? Get exclusive discounts.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
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

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Top Rated</h2>
              <p className="text-gray-500 mt-1">Our customers' favorites</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 text-brand-600 font-medium hover:text-brand-700 text-sm"
            >
              <span>View All</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 mt-1">Fresh picks just for you</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 text-brand-600 font-medium hover:text-brand-700 text-sm"
            >
              <span>Shop All</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Shop Smarter?
          </h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">
            Our AI Clerk is ready to help you find the perfect items, negotiate
            the best prices, and make your shopping experience truly personal.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-white text-brand-700 px-8 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors shadow-lg"
          >
            <span>Start Shopping</span>
            <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
