import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import {
  HiOutlineStar,
  HiOutlineShoppingBag,
  HiArrowLeft,
  HiOutlineHeart,
  HiHeart,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
} from "react-icons/hi";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import useScrollReveal from "../hooks/useScrollReveal";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === parseInt(id));
  const revealRef = useScrollReveal();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  /* Image zoom on hover */
  const imgRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(1.6)" });
  };
  const handleMouseLeave = () => setZoomStyle({});

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
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
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    toast.success(`${product.name} added to cart!`, {
      style: { borderRadius: "12px", background: "#333", color: "#fff" },
      iconTheme: { primary: "#4c6ef5", secondary: "#fff" },
    });
  };

  return (
    <div className="min-h-screen bg-white page-enter" ref={revealRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium group"
        >
          <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image with hover zoom */}
          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in relative group"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 ease-out"
              style={zoomStyle}
            />
            {/* Discount badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                -{product.discount}% OFF
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="animate-fade-up visible">
              <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-2">
                {product.category} / {product.subcategory}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <HiOutlineStar
                    key={i}
                    className={`w-5 h-5 transition-colors ${
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
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="ml-3 text-lg text-gray-400 line-through">
                  ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Color:{" "}
                  <span className="text-brand-600">
                    {selectedColor || product.colors[0]}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        (selectedColor || product.colors[0]) === color
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
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
                      className={`w-12 h-12 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                        (selectedSize || product.sizes[0]) === size
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
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
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-medium transition-all duration-200 active:scale-90"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-medium transition-all duration-200 active:scale-90"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 btn-ripple inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base active:scale-[0.97] ${
                  addedToCart
                    ? "bg-green-500 text-white shadow-green-500/25"
                    : "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/25 hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                <span>
                  {addedToCart
                    ? "Added!"
                    : product.inStock
                    ? "Add to Cart"
                    : "Out of Stock"}
                </span>
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300 flex-shrink-0 active:scale-90 ${
                  wishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-red-400"
                }`}
              >
                {wishlisted ? (
                  <HiHeart className="w-6 h-6" />
                ) : (
                  <HiOutlineHeart className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: HiOutlineTruck, text: "Free Shipping" },
                { icon: HiOutlineShieldCheck, text: "Secure Payment" },
                { icon: HiOutlineRefresh, text: "Easy Returns" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl"
                >
                  <item.icon className="w-5 h-5 text-brand-600 mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24 animate-fade-up">
            <div className="text-center mb-10">
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
                More to Explore
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                You May Also Like
              </h2>
            </div>
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
