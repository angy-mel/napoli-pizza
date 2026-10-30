import "./Hero.css";

function Hero({ language }) {
  return (
    <section className="hero">
      <button
        className="order-btn"
        onClick={() =>
          document
            .getElementById("pizze")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span>{language === "it" ? "Ordina ora" : "Order now"}</span>
        <span>⬇</span>
      </button>
    </section>
  );
}

export default Hero;
