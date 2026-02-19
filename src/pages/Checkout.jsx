import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineCheck, HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, coupon, getCartTotal, clearCart } = useCart();
  const { subtotal, discount, total } = getCartTotal();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate order placement
    setPlaced(true);
    clearCart();
    toast.success("Order placed successfully!", {
      duration: 4000,
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-500 mb-2">
            Thank you for your purchase. Your order has been placed.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Order #SV-{Math.random().toString(36).substr(2, 8).toUpperCase()}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No items to checkout
          </h2>
          <Link
            to="/products"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Go Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={form.cardNumber}
                      onChange={handleChange}
                      placeholder="4242 4242 4242 4242"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={form.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="cardCVC"
                        value={form.cardCVC}
                        onChange={handleChange}
                        placeholder="123"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Discount ({coupon.code})
                      </span>
                      <span className="font-medium text-green-600">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
                >
                  Place Order — ${total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
