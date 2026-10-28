import { useEffect, useRef } from "react";

function PaymentResult({ language }) {
  const alertShown = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (alertShown.current) return;
    alertShown.current = true;
    if (!payment) return;

    if (payment === "success") {
      alert(
        language === "it"
          ? "Pagamento completato! Grazie per il tuo ordine."
          : "Payment completed! Thank you for your order.",
      );

      document.getElementById("cart")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (payment === "cancelled") {
      alert(
        language === "it"
          ? "Pagamento annullato. Puoi tornare al menu e riprovare."
          : "Payment cancelled. You can return to the menu and try again.",
      );
    }
  }, []);

  return null;
}

export default PaymentResult;
