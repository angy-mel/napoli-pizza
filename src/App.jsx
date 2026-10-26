import "./components/menu/menu.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/layout/Hero";
import PizzaSection from "./components/menu/PizzaSection";
import FritturaSection from "./components/menu/FritturaSection";
import BevandeSection from "./components/menu/BevandeSection";
import Cart from "./components/cart/Cart";
import Footer from "./components/layout/Footer";
import Admin from "./pages/Admin";

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    const savedTime = localStorage.getItem("cartTime");

    if (!savedCart || !savedTime) {
      return [];
    }
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - Number(savedTime) > twentyFourHours) {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartTime");
      return [];
    }
    return JSON.parse(savedCart);
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (cart.length > 0) {
      localStorage.setItem("cartTime", Date.now().toString());
    } else {
      localStorage.removeItem("cartTime");
    }
  }, [cart]);

  const [language, setLanguage] = useState("it");
  const [activeOrders, setActiveOrders] = useState(() => {
    const savedOrders = localStorage.getItem("activeOrders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  useEffect(() => {
    if (activeOrders.length > 0) {
      localStorage.setItem("activeOrders", JSON.stringify(activeOrders));
    } else {
      localStorage.removeItem("activeOrders");
    }
  }, [activeOrders]);
  useEffect(() => {
    if (activeOrders.length === 0) return;
    const checkOrders = async () => {
      const results = await Promise.all(
        activeOrders.map(async (order) => {
          try {
            const response = await fetch(
              `http://192.168.1.243:3000/track-order/${order.orderNumber}`,
            );
            if (response.status === 404) {
              return null;
            }
            return order;
          } catch (error) {
            console.error(
              `Errore nel controllo dell'ordine ${order.orderNumber}:`,
              error,
            );
            return order;
          }
        }),
      );
      const remainingOrder = results.filter(Boolean);
      if (remainingOrder.length !== activeOrders.length) {
        setActiveOrders(remainingOrder);
      }
    };
    checkOrders();
    const interval = setInterval(checkOrders, 10000);
    return () => clearInterval(interval);
  }, [activeOrders]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="hero-section">
                <Header
                  cart={cart}
                  language={language}
                  setLanguage={setLanguage}
                />
                <Hero language={language} />
              </div>
              <a href="#cart" className="mobile-cart">
                🛒
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </a>
              <PizzaSection setCart={setCart} language={language} />
              <FritturaSection setCart={setCart} language={language} />
              <BevandeSection setCart={setCart} language={language} />
              <Cart
                cart={cart}
                setCart={setCart}
                language={language}
                activeOrders={activeOrders}
                setActiveOrders={setActiveOrders}
              />
              <Footer />
            </>
          }
        />

        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
