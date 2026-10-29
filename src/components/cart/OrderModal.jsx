import "./OrderModal.css";
import "./OrderForm.css";
import { useState } from "react";
import DeliveryChoice from "./DeliveryChoice";
import CustomerForm from "./CustomerForm";
import PaymentChoice from "./PaymentChoice";

function OrderModal({
  cart,
  language,
  setIsOrderOpen,
  setCart,
  onOrderSuccess,
}) {
  const [deliveryType, setDeliveryType] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const houseNumber = formData.get("houseNumber");
    const zipCode = formData.get("zipCode");

    if (!deliveryType) {
      alert(
        language === "it"
          ? "Scegli come vuoi ricevere l'ordine."
          : "Please choose how you want to receive the order.",
      );
      return;
    }

    if (!paymentMethod) {
      alert(
        language === "it"
          ? "Scegli il metodo di pagamento."
          : "Please choose a payment method.",
      );
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          houseNumber,
          zipCode,
          deliveryType,
          paymentMethod,
          cart,
        }),
      });

      const data = await response.json();

      if (paymentMethod === "card") {
        if (!data.checkoutUrl) {
          throw new Error("Stripe checkout URL is missing.");
        }

        localStorage.setItem(
          "pendingCardOrder",
          JSON.stringify({
            orderNumber: data.orderNumber ?? data.orderId,
            cart: [...cart],
            total: cart.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
          }),
        );
        console.log("Order response:", data);
        window.location.href = data.checkoutUrl;
        return;
      }

      form.reset();

      onOrderSuccess({
        orderNumber: data.orderId,
        cart: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });

      setOrderId(data.orderId);
      setCart([]);
      setIsOrderOpen(false);
    } catch (error) {
      console.error("Order error:", error);

      alert(
        language === "it"
          ? "Si è verificato un errore. Riprova."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="order-modal">
      <form className="order-modal-content" onSubmit={handleSubmit}>
        <button
          type="button"
          className="close-modal"
          onClick={() => setIsOrderOpen(false)}
        >
          x
        </button>
        <h2>{language === "it" ? "Il tuo ordine" : "Your order"}</h2>
        <p>
          {language === "it" ? "Inserisci i tuoi dati" : "Enter your details"}
        </p>
        <h3>
          {language === "it"
            ? "Come vuoi ricevere l'ordine?"
            : "How would you like to receive your order?"}
        </h3>
        <DeliveryChoice
          deliveryType={deliveryType}
          setDeliveryType={setDeliveryType}
          language={language}
        />
        <CustomerForm deliveryType={deliveryType} language={language} />
        <PaymentChoice
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          language={language}
        />

        {!orderId && (
          <>
            {!isLoading ? (
              <button className="confirm-order" type="submit">
                {language === "it" ? "CONFERMA ORDINE" : "CONFIRM ORDER"}
              </button>
            ) : (
              <div className="loading-spinner"></div>
            )}
          </>
        )}
      </form>
    </div>
  );
}

export default OrderModal;
