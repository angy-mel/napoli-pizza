import "./Header.css";
import { useState } from "react";
import TrackOrder from "../tracking/TrackOrder";

function Header({ cart, language, setLanguage }) {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);

  return (
    <header>
      <h1>🍕 Napoli Pizza</h1>
      <div className="language-switcher">
        <button onClick={() => setLanguage("it")}>IT</button>
        <span>|</span>
        <button onClick={() => setLanguage("en")}>EN</button>
      </div>
      <div className="header-actions">
        <nav>
          <button
            onClick={() =>
              document
                .getElementById("pizze")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Pizza
          </button>

          <button
            onClick={() =>
              document
                .getElementById("frittura")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {language === "it" ? "Frittura" : "Fried Food"}
          </button>

          <button
            onClick={() =>
              document
                .getElementById("bevande")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {language === "it" ? "Bevande" : "Drinks"}
          </button>
        </nav>

        <button
          className="cart-link"
          onClick={() =>
            document
              .getElementById("cart")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          🛒 {cartCount > 0 && <span>{cartCount}</span>}
        </button>

        <button onClick={() => setIsTrackOrderOpen(true)}>
          {language === "it" ? "Traccia ordine" : "Track order"}
        </button>
      </div>

      {isTrackOrderOpen && (
        <TrackOrder
          language={language}
          onClose={() => setIsTrackOrderOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;
