import { useState } from "react";
import "./TrackOrder.css";
import { createPortal } from "react-dom";

function TrackOrder({ onClose, language }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    const number = orderNumber.trim();
    if (!number) {
      setMessage(
        language === "it"
          ? "Inserisci il numero dell'ordine."
          : "Enter your order number.",
      );
      return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/track-order/${encodeURIComponent(number)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        setMessage(
          language === "it" ? "Ordine non trovato." : "Order not found.",
        );
        return;
      }
      if (data.status === "received") {
        setMessage(
          language === "it"
            ? "Il tuo ordine è in preparazione."
            : "Your order is ready!",
        );
      } else if (data.status === "ready") {
        setMessage(
          language === "it"
            ? "Il tuo ordine è pronto!"
            : "Your order is ready!",
        );
      } else {
        setMessage(
          language === "it" ? "Ordine non trovato." : "Order not found.",
        );
      }
    } catch {
      setMessage(
        language === "it"
          ? "Errore di connessione. Riprova."
          : "Connection error. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="track-overlay">
      <div className="track-modal">
        <button className="track-close" onClick={onClose} aria-label="Close">
          x
        </button>
        <h2>
          {language === "it"
            ? "Inserisci il numero dell'ordine"
            : "Enter the order number"}
        </h2>
        <form onSubmit={handleTrackOrder}>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={language === "it" ? "Numero ordine" : "Order number"}
          />
          <button type="submit" aria-label="Ok" disabled={isLoading}>
            {isLoading ? "..." : "✓"}
          </button>
        </form>
        {message && <p className="track-message">{message}</p>}
      </div>
    </div>,

    document.body,
  );
}
export default TrackOrder;
