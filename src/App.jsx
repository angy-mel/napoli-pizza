import "./components/menu/menu.css";
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/layout/Hero";
import PizzaSection from "./components/menu/PizzaSection";
import FritturaSection from "./components/menu/FritturaSection";
import BevandeSection from "./components/menu/BevandeSection";
import Cart from "./components/cart/Cart";
import Footer from "./components/layout/Footer";
import Admin from "./pages/Admin";
import PaymentResult from "./components/cart/PaymentResult";

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
    if (cart.length === 0) {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartTime");
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartTime", Date.now().toString());
  }, [cart]);

  const [language, setLanguage] = useState("it");
  const [showPaymentResult, setShowPaymentResult] = useState(() =>
    new URLSearchParams(window.location.search).has("payment"),
  );
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
              `${import.meta.env.VITE_API_URL}/track-order/${order.orderNumber}`,
            );

            if (response.status === 404) {
              return null;
            }

            if (!response.ok) {
              return order;
            }

            const data = await response.json();

            if (data.status === "completed") {
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

      const remainingOrders = results.filter(Boolean);

      if (remainingOrders.length !== activeOrders.length) {
        setActiveOrders(remainingOrders);
      }
    };

    checkOrders();

    const interval = setInterval(checkOrders, 10000);

    return () => clearInterval(interval);
  }, [activeOrders]);
  useEffect(() => {
    const savedOrder = localStorage.getItem("pendingCardOrder");

    if (!savedOrder) return;

    try {
      const order = JSON.parse(savedOrder);

      setActiveOrders((previousOrders) => {
        const alreadyExists = previousOrders.some(
          (item) => item.orderNumber === order.orderNumber,
        );

        return alreadyExists ? previousOrders : [...previousOrders, order];
      });

      setCart([]);
      localStorage.removeItem("cart");
      localStorage.removeItem("cartTime");
      localStorage.removeItem("pendingCardOrder");
    } catch (error) {
      console.error("Errore nel recupero dell'ordine:", error);
    }
  }, []);
  return (
    <HashRouter>
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
              <PaymentResult language={language} />

              <button
                className="mobile-cart"
                onClick={() =>
                  document
                    .getElementById("cart")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                🛒
                {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
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
    </HashRouter>
  );
}

export default App;
