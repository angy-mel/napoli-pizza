function OrderSummary({ cart, language }) {
  return (
    <div className="order-summary">
      <h3>{language === "it" ? "Riepilogo ordine" : "Order summary"}</h3>

      {cart.map((item) => (
        <div className="summary-item" key={`${item.id}-${item.size}`}>
          <span>
            {item.name[language]}
            {item.size && (
              <>
                {" ("}
                {language === "it"
                  ? item.size === "small"
                    ? "piccola"
                    : "grande"
                  : item.size === "small"
                    ? "small"
                    : "large"}
                {")"}
              </>
            )}
            {" × "}
            {item.quantity}
          </span>

          <span>€{(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
      <div className="summary-total">
        <span>{language === "it" ? "TOTALE:" : "TOTAL:"}</span>

        <strong>
          €
          {cart
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)}
        </strong>
      </div>
    </div>
  );
}
export default OrderSummary;
