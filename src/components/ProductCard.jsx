import { Link } from "react-router-dom";
import {
  HiOutlineStar,
  HiOutlineShoppingBag,
  HiOutlineEye,
} from "react-icons/hi";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product, highlighted = false }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.colors?.[0], product.sizes?.[0], 1);
    toast.success(`${product.name} added to cart!`, {
      style: { borderRadius: "12px", background: "#333", color: "#fff" },
      iconTheme: { primary: "#4c6ef5", secondary: "#fff" },
    });
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block rounded-2xl overflow-hidden bg-white border transition-all duration-500 ease-out-expo hover:shadow-2xl hover:-translate-y-2 ${
        highlighted
          ? "border-brand-400 ring-2 ring-brand-100 shadow-lg"
          : "border-gray-100 shadow-sm hover:border-brand-200"
      }`}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out-expo"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quick action buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out-expo">
          {product.inStock && (
            <button
              onClick={handleQuickAdd}
              className="flex-1 btn-ripple inline-flex items-center justify-center space-x-1.5 bg-white/90 backdrop-blur-sm text-gray-900 py-2 rounded-lg text-xs font-semibold hover:bg-white transition-colors shadow-lg"
            >
              <HiOutlineShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg hover:bg-white transition-colors flex-shrink-0">
            <HiOutlineEye className="w-4 h-4 text-gray-700" />
          </div>
        </div>

        {/* Badges */}
        {highlighted && (
          <div className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg animate-bounce-subtle">
            Recommended
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            -{product.discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-semibold text-lg bg-black/30 px-4 py-2 rounded-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2.5 group-hover:text-brand-700 transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-0.5 rounded-full">
            <HiOutlineStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700">
              {product.rating}
            </span>
          </div>
        </div>
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2.5">
            {product.colors.slice(0, 4).map((color, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded"
              >
                {color}
              </span>
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
