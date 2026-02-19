import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineChatAlt2,
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineAdjustments,
  HiOutlineTag,
  HiOutlineExternalLink,
} from "react-icons/hi";
import { useCart } from "../context/CartContext";
import { useFilter } from "../context/FilterContext";
import { chatWithClerk } from "../services/clerkAI";
import toast from "react-hot-toast";

// ─── Message Component ──────────────────────────────────────────────────
function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isAction = message.role === "action";

  if (isAction) {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center space-x-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full">
          {message.actionType === "cart" && (
            <HiOutlineShoppingBag className="w-3.5 h-3.5" />
          )}
          {message.actionType === "filter" && (
            <HiOutlineAdjustments className="w-3.5 h-3.5" />
          )}
          {message.actionType === "coupon" && (
            <HiOutlineTag className="w-3.5 h-3.5" />
          )}
          {message.actionType === "navigate" && (
            <HiOutlineExternalLink className="w-3.5 h-3.5" />
          )}
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        }`}
      >
        {!isUser && (
          <div className="flex items-center space-x-1.5 mb-1">
            <HiOutlineSparkles className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-semibold text-brand-600">
              The Clerk
            </span>
          </div>
        )}
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
        />
      </div>
    </div>
  );
}

// ─── Simple Markdown-like formatting ────────────────────────────────────
function formatMessage(text) {
  if (!text) return "";
  return (
    text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Links [text](/path)
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-brand-600 hover:text-brand-700 underline font-medium" data-internal="true">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, "<br/>")
      // Bullet points
      .replace(
        /^[•●] (.+)/gm,
        '<div class="flex items-start space-x-1"><span class="text-brand-500 mt-0.5">•</span><span>$1</span></div>'
      )
      .replace(
        /^- (.+)/gm,
        '<div class="flex items-start space-x-1"><span class="text-brand-500 mt-0.5">•</span><span>$1</span></div>'
      )
      // Star ratings
      .replace(/⭐/g, '<span class="text-yellow-400">★</span>')
  );
}

// ─── Quick Suggestion Chips ─────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  {
    label: "🔍 Summer outfit",
    message: "I need an outfit for a summer wedding in Italy",
  },
  { label: "💰 Show deals", message: "Show me the cheapest options" },
  { label: "🎁 Gift ideas", message: "I need a gift for someone" },
  {
    label: "🤝 Get a discount",
    message: "Can I get a discount? It's my birthday!",
  },
  { label: "💡 Recommend", message: "What do you recommend for me?" },
];

// ─── Main Chat Widget ──────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        'Hey there! 👋 I\'m **The Clerk**, your personal shopping assistant at StyleVault.\n\nI can help you find products, check inventory, add items to your cart, and even negotiate discounts. Just tell me what you need!\n\nTry asking me things like:\n- "I need a summer wedding outfit"\n- "Show me cheaper options"\n- "Can I get a birthday discount?"',
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cart & Filter integration
  const {
    addToCart,
    removeFromCart,
    clearCart,
    applyCoupon,
    items: cartItems,
    getCartTotal,
    getCartCount,
    activity,
  } = useCart();
  const {
    setSortBy,
    setSelectedCategory,
    setSearchQuery,
    setHighlightedProducts,
  } = useFilter();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle clicking internal links in chat messages
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a[data-internal="true"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (href.startsWith("/")) {
          navigate(href);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [navigate]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const actionCallbacks = {
        addToCart: (product, color, size, qty) => {
          addToCart(product, color, size, qty);
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "cart",
              content: `Added ${product.name} to cart`,
            },
          ]);
          toast.success(`${product.name} added to cart!`, {
            style: { borderRadius: "12px", background: "#333", color: "#fff" },
          });
        },
        setSortBy: (val) => {
          setSortBy(val);
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "filter",
              content: `Updated sort: ${val}`,
            },
          ]);
        },
        setSelectedCategory: (val) => {
          setSelectedCategory(val);
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "filter",
              content: `Filtered to: ${val}`,
            },
          ]);
        },
        setSearchQuery: (val) => {
          setSearchQuery(val);
        },
        setHighlightedProducts: (ids) => {
          setHighlightedProducts(ids);
        },
        navigateTo: (path) => {
          navigate(path);
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "navigate",
              content: `Navigated to ${path}`,
            },
          ]);
        },
        applyCoupon: (coupon) => {
          applyCoupon(coupon);
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "coupon",
              content: `Coupon ${coupon.code} applied! ${coupon.discount}% off`,
            },
          ]);
          toast.success(`🎉 Coupon ${coupon.code} applied!`, {
            duration: 4000,
            style: { borderRadius: "12px", background: "#333", color: "#fff" },
          });
        },
        getActivity: () => activity,
        // New callbacks for full clerk automation
        removeFromCart: (index) => {
          const item = cartItems[index];
          removeFromCart(index);
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "cart",
              content: `Removed ${item?.name || "item"} from cart`,
            },
          ]);
          toast.success(`${item?.name || "Item"} removed from cart`, {
            style: { borderRadius: "12px", background: "#333", color: "#fff" },
          });
        },
        clearCart: () => {
          clearCart();
          setMessages((prev) => [
            ...prev,
            {
              role: "action",
              actionType: "cart",
              content: "Cart cleared",
            },
          ]);
          toast.success("Cart cleared!", {
            style: { borderRadius: "12px", background: "#333", color: "#fff" },
          });
        },
        getCartItems: () => cartItems,
        getCartTotal: () => getCartTotal(),
      };

      const result = await chatWithClerk(history, userMsg, actionCallbacks);

      setHistory(result.updatedHistory);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I hit a snag. Could you try that again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-brand-600 text-white w-14 h-14 rounded-full shadow-xl shadow-brand-600/30 flex items-center justify-center hover:bg-brand-700 transition-all hover:scale-105 group"
          aria-label="Open AI Clerk chat"
        >
          <HiOutlineChatAlt2 className="w-6 h-6" />
          {/* Pulse */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[400px] h-[600px] max-h-[85vh] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">The Clerk</h3>
                <p className="text-brand-200 text-xs">
                  AI Personal Shopper
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full ml-1.5 animate-pulse" />
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center space-x-1.5">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" />
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (only when few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.message)}
                  className="text-xs bg-gray-50 hover:bg-brand-50 text-gray-600 hover:text-brand-700 border border-gray-200 hover:border-brand-200 px-2.5 py-1.5 rounded-full transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Powered by Groq + LLaMA • Try "haggle" for discounts!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
