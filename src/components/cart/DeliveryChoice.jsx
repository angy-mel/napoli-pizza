function DeliveryChoice({ deliveryType, setDeliveryType, language }) {
  return (
    <div className="delivery-choice">
      <button
        type="button"
        className={deliveryType === "delivery" ? "active" : ""}
        onClick={() => setDeliveryType("delivery")}
      >
        🛵 {language === "it" ? "Consegna a domicilio" : "Home delivery"}
      </button>

      <button
        className={deliveryType === "pickup" ? "active" : ""}
        onClick={() => setDeliveryType("pickup")}
      >
        🏠 {language === "it" ? "Ritiro in pizzeria" : "Pickup"}
      </button>
    </div>
  );
}
export default DeliveryChoice;
