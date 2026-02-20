import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import useScrollReveal from "../hooks/useScrollReveal";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiArrowRight,
  HiOutlineShoppingBag,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineRefresh,
} from "react-icons/hi";

export default function Cart() {
  const {
    items,
    coupon,
    removeFromCart,
    updateQuantity,
    removeCoupon,
    getCartTotal,
    getCartCount,
  } = useCart();
  const { subtotal, discount, total } = getCartTotal();
  const count = getCartCount();
  const revealRef = useScrollReveal();
  const [removingIdx, setRemovingIdx] = useState(null);

  const handleRemove = (index) => {
    setRemovingIdx(index);
    setTimeout(() => {
      removeFromCart(index);
      setRemovingIdx(null);
    }, 300);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center page-enter">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <HiOutlineShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added anything yet. Browse our collection and
            find something you love.
          </p>
          <Link
            to="/products"
            className="btn-ripple inline-flex items-center space-x-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-all duration-300 hover:shadow-lg hover:shadow-brand-600/25 hover:-translate-y-0.5"
          >
            <span>Start Shopping</span>
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-enter" ref={revealRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-up mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-500">
            {count} item{count !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                className={`animate-fade-up bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                  removingIdx === index
                    ? "opacity-0 -translate-x-8 scale-95"
                    : ""
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <Link
                    to={`/product/${item.id}`}
                    className="flex-shrink-0 group"
                  >
                    <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="font-semibold text-gray-900 hover:text-brand-600 transition-colors text-sm sm:text-base"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 p-2 rounded-lg active:scale-90"
                        title="Remove item"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.selectedColor && (
                        <span className="text-xs bg-brand-50 text-brand-600 px-2.5 py-0.5 rounded-full font-medium">
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-90"
                        >
                          <HiOutlineMinus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-90"
                        >
                          <HiOutlinePlus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-gray-900 text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="animate-fade-up">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">
                        Discount ({coupon.code})
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="font-medium text-green-600">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-ripple w-full inline-flex items-center justify-center space-x-2 bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-all duration-300 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Proceed to Checkout</span>
                <HiArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/products"
                className="w-full inline-flex items-center justify-center text-sm text-gray-500 hover:text-brand-600 font-medium mt-4 transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                {[
                  { icon: HiOutlineTruck, text: "Free shipping on all orders" },
                  { icon: HiOutlineShieldCheck, text: "Secure checkout" },
                  { icon: HiOutlineRefresh, text: "30-day easy returns" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center space-x-2 text-xs text-gray-400"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
