import "./Hero.css";

function Hero({ language }) {
  return (
    <section className="hero">
      <a href="#pizze" className="order-btn">
        <span>{language === "it" ? "Ordina ora" : "Order now"}</span>
        <span>⬇</span>
      </a>
    </section>
  );
}

export default Hero;
