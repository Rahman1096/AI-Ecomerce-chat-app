import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HiOutlineStar,
  HiOutlineShoppingBag,
  HiArrowLeft,
  HiOutlineHeart,
} from "react-icons/hi";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, trackActivity } = useCart();
  const product = products.find((p) => p.id === parseInt(id));

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <Link
            to="/products"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Track view
  if (typeof window !== "undefined") {
    const viewKey = `viewed_${product.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "true");
      // will be tracked in useEffect ideally, but keeping it simple
    }
  }

  // Related products
  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.tags.some((t) => product.tags.includes(t)))
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    const color = selectedColor || product.colors[0];
    const size = selectedSize || product.sizes[0];
    addToCart(product, color, size, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
      },
      iconTheme: {
        primary: "#4c6ef5",
        secondary: "#fff",
      },
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-sm text-brand-600 font-medium uppercase tracking-wider mb-2">
              {product.category} / {product.subcategory}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <HiOutlineStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        (selectedColor || product.colors[0]) === color
                          ? "bg-brand-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                        (selectedSize || product.sizes[0]) === size
                          ? "bg-brand-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-medium transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-medium transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-brand-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                <span>{product.inStock ? "Add to Cart" : "Out of Stock"}</span>
              </button>
              <button className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <HiOutlineHeart className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
