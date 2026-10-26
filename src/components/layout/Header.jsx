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
          <a href="#pizze">Pizza</a>
          <a href="#frittura">
            {language === "it" ? "Frittura" : "Fried Food"}
          </a>
          <a href="#bevande">{language === "it" ? "Bevande" : "Drinks"}</a>
        </nav>
        <a href="#cart" className="cart-link">
          🛒 {cartCount > 0 && <span>{cartCount}</span>}
        </a>

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
