import { useState } from "react";

function MenuCard({ item, setCart, type, language }) {
  const [size, setSize] = useState("small");
  const price =
    type === "frittura"
      ? item.price
      : size === "small"
        ? item.smallPrice
        : item.largePrice;

  return (
    <div className="menu-card" key={item.name}>
      <img src={item.image} alt={item.name} />

      <h3>{item.name[language]}</h3>
      {type !== "frittura" && (
        <div className="menu-size">
          <button
            onClick={() => setSize("small")}
            className={size === "small" ? "active" : ""}
          >
            {language === "it" ? "Piccola" : "Small"}
          </button>
          <button
            onClick={() => setSize("large")}
            className={size === "large" ? "active" : ""}
          >
            {language === "it" ? "Grande" : "Large"}
          </button>
        </div>
      )}
      <div className="menu-bottom">
        <span>€{price.toFixed(2)}</span>
        <button
          onClick={() => {
            setCart((currentCart) => {
              const existingItem = currentCart.find(
                (cartItem) =>
                  cartItem.id === item.id &&
                  cartItem.size === (type === "frittura" ? null : size),
              );
              if (existingItem) {
                return currentCart.map((cartItem) =>
                  cartItem === existingItem
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem,
                );
              }
              return [
                ...currentCart,
                {
                  id: item.id,
                  name: item.name,
                  image: item.image,
                  size: type === "frittura" ? null : size,
                  price: price,
                  quantity: 1,
                },
              ];
            });
          }}
        >
          {language === "it" ? "Aggiungi +" : "Add +"}
        </button>
      </div>
    </div>
  );
}
export default MenuCard;
