import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineCheck, HiArrowLeft, HiLockClosed } from "react-icons/hi";
import toast from "react-hot-toast";

/* ── Card-brand detection ── */
const detectBrand = (num) => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^6(?:011|5)/.test(n)) return "discover";
  return null;
};

const brandLogos = {
  visa: (
    <svg viewBox="0 0 48 32" className="h-6 w-9">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="#fff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial"
      >
        VISA
      </text>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 48 32" className="h-6 w-9">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="9" fill="#EB001B" />
      <circle cx="29" cy="16" r="9" fill="#F79E1B" />
      <path d="M24 9.5a9 9 0 010 13 9 9 0 010-13z" fill="#FF5F00" />
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 48 32" className="h-6 w-9">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="#fff"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Arial"
      >
        AMEX
      </text>
    </svg>
  ),
  discover: (
    <svg viewBox="0 0 48 32" className="h-6 w-9">
      <rect width="48" height="32" rx="4" fill="#FF6000" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="#fff"
        fontSize="7"
        fontWeight="bold"
        fontFamily="Arial"
      >
        DISCOVER
      </text>
    </svg>
  ),
};

/* ── Format helpers ── */
const formatCardNumber = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
};

/* ── Processing steps animation ── */
const STEPS = [
  "Verifying card details…",
  "Authorising payment…",
  "Confirming order…",
];

export default function Checkout() {
  const { items, coupon, getCartTotal, clearCart } = useCart();
  const { subtotal, discount, total } = getCartTotal();
  const navigate = useNavigate();

  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [cardError, setCardError] = useState(null);

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
    cardName: "",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "cardNumber") value = formatCardNumber(value);
    if (name === "cardExpiry") value = formatExpiry(value);
    if (name === "cardCVC") value = value.replace(/\D/g, "").slice(0, 4);
    setForm((f) => ({ ...f, [name]: value }));
    if (cardError) setCardError(null);
  };

  const validate = () => {
    const num = form.cardNumber.replace(/\s/g, "");
    if (num.length < 13) return "Card number is too short";
    if (!form.cardExpiry.includes("/")) return "Enter a valid expiry (MM/YY)";
    const [mm, yy] = form.cardExpiry.replace(/\s/g, "").split("/");
    if (+mm < 1 || +mm > 12) return "Invalid expiry month";
    const expYear = 2000 + +yy;
    const now = new Date();
    if (
      expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && +mm < now.getMonth() + 1)
    )
      return "Card has expired";
    if (form.cardCVC.length < 3) return "CVC must be 3-4 digits";
    if (!form.cardName.trim()) return "Enter the name on card";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setCardError(err);
      return;
    }

    setLoading(true);
    setStepIdx(0);

    /* Simulate processing steps */
    for (let i = 0; i < STEPS.length; i++) {
      setStepIdx(i);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    }

    setPlaced(true);
    clearCart();
    toast.success("Payment successful! Order placed.", {
      duration: 4000,
      style: { borderRadius: "12px", background: "#333", color: "#fff" },
    });
    setLoading(false);
  };

  const brand = detectBrand(form.cardNumber);

  /* ── Order confirmed screen ── */
  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_0.6s_ease]">
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

  /* ── Empty cart guard ── */
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

  /* ── Processing overlay ── */
  const processingOverlay = loading && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <svg
          className="animate-spin h-10 w-10 text-brand-600 mx-auto mb-5"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-gray-900 font-semibold mb-3">Processing Payment</p>
        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center space-x-2 text-sm transition-opacity duration-300 ${
                i <= stepIdx ? "opacity-100" : "opacity-30"
              }`}
            >
              {i < stepIdx ? (
                <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : i === stepIdx ? (
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span
                className={
                  i < stepIdx
                    ? "text-green-600"
                    : i === stepIdx
                    ? "text-gray-900"
                    : "text-gray-400"
                }
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {processingOverlay}
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
              {/* ── Left column: fields ── */}
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

                {/* Payment — Custom card inputs */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Payment</h2>
                    <span className="inline-flex items-center space-x-1 text-xs text-gray-400">
                      <HiLockClosed className="w-3.5 h-3.5" />
                      <span>Secure Payment</span>
                    </span>
                  </div>

                  {/* Accepted cards */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs text-gray-400 mr-1">
                      We accept
                    </span>
                    {Object.entries(brandLogos).map(([key, svg]) => (
                      <span
                        key={key}
                        className={`transition-opacity ${
                          brand && brand !== key ? "opacity-30" : "opacity-100"
                        }`}
                      >
                        {svg}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={handleChange}
                          placeholder="4242 4242 4242 4242"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          required
                          className="w-full px-4 py-2.5 pr-14 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm tracking-wider font-mono"
                        />
                        {brand && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {brandLogos[brand]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name on card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={form.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        autoComplete="cc-name"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                      />
                    </div>

                    {/* Expiry & CVC */}
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
                          placeholder="MM / YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm tracking-wider font-mono"
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
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm tracking-wider font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {cardError && (
                    <p className="mt-3 text-sm text-red-500 flex items-center space-x-1">
                      <span className="inline-block w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        !
                      </span>
                      <span>{cardError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Right column: summary ── */}
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
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
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
                    disabled={loading}
                    className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <HiLockClosed className="w-4 h-4" />
                    <span>Pay ${total.toFixed(2)}</span>
                  </button>

                  <p className="mt-3 text-center text-[11px] text-gray-400">
                    Demo mode — no real charges will be made
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
