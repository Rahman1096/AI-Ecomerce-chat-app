import { useMemo } from "react";
import ProductCard from "../components/ProductCard";
import products from "../data/products";
import { useFilter } from "../context/FilterContext";
import useScrollReveal from "../hooks/useScrollReveal";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";

const categories = ["All", ...new Set(products.map((p) => p.category))];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name A-Z" },
];

export default function Products() {
  const {
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    highlightedProducts,
  } = useFilter();
  const revealRef = useScrollReveal();

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        if (highlightedProducts.length > 0) {
          result.sort((a, b) => {
            const aH = highlightedProducts.includes(a.id) ? 0 : 1;
            const bH = highlightedProducts.includes(b.id) ? 0 : 1;
            return aH - bH;
          });
        }
    }

    return result;
  }, [sortBy, selectedCategory, searchQuery, highlightedProducts]);

  return (
    <div className="min-h-screen bg-gray-50 page-enter" ref={revealRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-gray-900">
            Shop All Products
          </h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>

        {/* Filters Bar */}
        <div className="animate-fade-up bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition-all"
              />
            </div>

            {/* Category */}
            <div className="flex items-center space-x-2">
              <HiOutlineAdjustments className="text-gray-400 w-5 h-5 flex-shrink-0 hidden sm:block" />
              <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat
                        ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none bg-white w-full sm:w-auto transition-all"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 stagger-children">
            {filtered.map((product) => (
              <div key={product.id} className="animate-fade-up">
                <ProductCard
                  product={product}
                  highlighted={highlightedProducts.includes(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineSearch className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg">
              No products found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("featured");
              }}
              className="mt-4 text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
