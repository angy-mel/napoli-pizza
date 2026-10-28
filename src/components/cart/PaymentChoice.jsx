function PaymentChoice({ paymentMethod, setPaymentMethod, language }) {
  return (
    <div className="payment-choice">
      <h3>{language === "it" ? "Metodo di pagamento" : "Payment method"}</h3>

      <button
        type="button"
        className={paymentMethod === "cash" ? "active" : ""}
        onClick={() => setPaymentMethod("cash")}
      >
        💶 {language === "it" ? "Contanti" : "Cash"}
      </button>

      <button
        type="button"
        className={paymentMethod === "card" ? "active" : ""}
        onClick={() => setPaymentMethod("card")}
      >
        💳 {language === "it" ? "Carta" : "Card"}
      </button>
    </div>
  );
}
export default PaymentChoice;
