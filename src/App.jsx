import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import { FilterProvider } from "./context/FilterContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

export default function App() {
  return (
    <CartProvider>
      <FilterProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
          <Toaster position="bottom-right" />
        </div>
      </FilterProvider>
    </CartProvider>
  );
}
