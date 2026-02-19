import { Link } from "react-router-dom";
import { HiOutlineStar } from "react-icons/hi";

export default function ProductCard({ product, highlighted = false }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block rounded-2xl overflow-hidden bg-white border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        highlighted
          ? "border-brand-400 ring-2 ring-brand-100 shadow-lg"
          : "border-gray-100 shadow-sm"
      }`}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {highlighted && (
          <div className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Recommended
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-1">
            <HiOutlineStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1 mt-2">
            {product.colors.slice(0, 4).map((color, i) => (
              <span key={i} className="text-xs text-gray-400">
                {color}
                {i < Math.min(product.colors.length, 4) - 1 ? "," : ""}
              </span>
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-400">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
