import "./Cart.css";
import { useState } from "react";
import OrderModal from "./OrderModal";

function Cart({ cart, setCart, language, activeOrders, setActiveOrders }) {
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const translations = {
    it: {
      order: "Il tuo ordine",
      total: "TOTALE:",
      orderButton: "ORDINARE!",
    },
    en: {
      order: "Your order",
      total: "TOTAL:",
      orderButton: "ORDER!",
    },
  };

  const t = translations[language];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section id="cart">
      <h2>{t.order}</h2>
      <div className="cart-list">
        {cart.map((item) => (
          <div className="cart-item" key={`${item.id}-${item.size}`}>
            <img src={item.image} alt={item.name[language]} />

            <h3>
              {item.name[language]}
              {item.size && (
                <p>
                  (
                  {language === "it"
                    ? item.size === "small"
                      ? "piccola"
                      : "grande"
                    : item.size === "small"
                      ? "small"
                      : "large"}
                  )
                </p>
              )}
            </h3>

            <div className="cart-item-bottom">
              <span>€{item.price.toFixed(2)}</span>

              <div className="quantity">
                <button
                  onClick={() => {
                    setCart((currentCart) =>
                      currentCart.map((cartItem) =>
                        cartItem.id === item.id &&
                        cartItem.size === item.size &&
                        cartItem.quantity > 1
                          ? { ...cartItem, quantity: cartItem.quantity - 1 }
                          : cartItem,
                      ),
                    );
                  }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => {
                    setCart((currentCart) =>
                      currentCart.map((cartItem) =>
                        cartItem.id === item.id && cartItem.size === item.size
                          ? { ...cartItem, quantity: cartItem.quantity + 1 }
                          : cartItem,
                      ),
                    );
                  }}
                >
                  +
                </button>
              </div>

              <button
                className="trash"
                onClick={() => {
                  setCart((currentCart) =>
                    currentCart.filter(
                      (cartItem) =>
                        cartItem.id !== item.id || cartItem.size !== item.size,
                    ),
                  );
                }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <span>{t.total}</span>
        <strong>€{total.toFixed(2)}</strong>
      </div>
      <button
        className="order-button"
        onClick={() => {
          if (cart.length === 0 || total <= 0) return;
          setIsOrderOpen(true);
        }}
        disabled={cart.length === 0 || total <= 0}
      >
        {t.orderButton}
      </button>
      {activeOrders.map((order) => (
        <div className="active-order" key={order.orderNumber}>
          <h3>{language === "it" ? "RIEPILOGO ORDINE" : "ORDER SUMMARY"}</h3>

          <p>
            {language === "it" ? "Numero ordine:" : "Order number:"}{" "}
            <strong>{order.orderNumber}</strong>
          </p>

          <div className="active-order-items">
            {order.cart.map((item, index) => (
              <div
                className="active-order-item"
                key={`${item.id}-${item.size}-${index}`}
              >
                <span>
                  {item.name[language]}
                  {item.size &&
                    ` (${item.size === "small" ? "piccola" : "grande"})`}
                  {" × "}
                  {item.quantity}
                </span>

                <strong>€{(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <p className="active-order-total">
            {language === "it" ? "TOTALE:" : "TOTAL:"}{" "}
            <strong>€{order.total.toFixed(2)}</strong>
          </p>
        </div>
      ))}
      {isOrderOpen && (
        <OrderModal
          language={language}
          setIsOrderOpen={setIsOrderOpen}
          cart={cart}
          setCart={setCart}
          onOrderSuccess={(orderData) =>
            setActiveOrders((currentOrders) => [...currentOrders, orderData])
          }
        />
      )}
    </section>
  );
}

export default Cart;
