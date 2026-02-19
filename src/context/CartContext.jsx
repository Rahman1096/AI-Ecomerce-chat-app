import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "stylevault_cart";
const ACTIVITY_STORAGE_KEY = "stylevault_activity";

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadActivity() {
  try {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.selectedColor === action.payload.selectedColor &&
          item.selectedSize === action.payload.selectedSize
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === existing.id &&
            item.selectedColor === existing.selectedColor &&
            item.selectedSize === existing.selectedSize
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity || 1),
                }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ],
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item, index) =>
          index === action.payload.index
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };
    case "APPLY_COUPON":
      return {
        ...state,
        coupon: action.payload,
      };
    case "REMOVE_COUPON":
      return {
        ...state,
        coupon: null,
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        coupon: null,
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: loadCart(),
    coupon: null,
  });

  const [activity, setActivity] = useReducer((prev, action) => {
    if (action.type === "ADD") {
      const updated = [action.payload, ...prev].slice(0, 50);
      return updated;
    }
    return prev;
  }, loadActivity());

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Save activity to localStorage
  useEffect(() => {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
  }, [activity]);

  const addToCart = (product, selectedColor, selectedSize, quantity = 1) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...product, selectedColor, selectedSize, quantity },
    });
    trackActivity("add_to_cart", product);
  };

  const removeFromCart = (index) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: index });
  };

  const updateQuantity = (index, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { index, quantity } });
  };

  const applyCoupon = (coupon) => {
    dispatch({ type: "APPLY_COUPON", payload: coupon });
  };

  const removeCoupon = () => {
    dispatch({ type: "REMOVE_COUPON" });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const trackActivity = (type, product) => {
    setActivity({
      type: "ADD",
      payload: {
        type,
        productId: product.id,
        category: product.category,
        subcategory: product.subcategory,
        tags: product.tags,
        timestamp: Date.now(),
      },
    });
  };

  const getCartTotal = () => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (state.coupon) {
      const discount = subtotal * (state.coupon.discount / 100);
      return { subtotal, discount, total: subtotal - discount };
    }
    return { subtotal, discount: 0, total: subtotal };
  };

  const getCartCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        coupon: state.coupon,
        activity,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        trackActivity,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
