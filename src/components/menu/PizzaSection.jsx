import { pizzas } from "../../data/menu";
import MenuCard from "./MenuCard";

function PizzaSection({ setCart, language }) {
  return (
    <section id="pizze">
      <h2>{language === "it" ? "Le nostre pizze" : "Our pizzas"}</h2>
      <div className="pizza-list">
        {pizzas.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            setCart={setCart}
            language={language}
          />
        ))}
      </div>
    </section>
  );
}

export default PizzaSection;
