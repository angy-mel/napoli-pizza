import { fritture } from "../../data/menu";
import MenuCard from "./MenuCard";

function FritturaSection({ setCart, language }) {
  return (
    <section id="frittura">
      <h2>{language === "it" ? "Frittura" : "Fried Food"}</h2>
      <div className="frittura-list">
        {fritture.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            setCart={setCart}
            type="frittura"
            language={language}
          />
        ))}
      </div>
    </section>
  );
}
export default FritturaSection;
