import { bevande } from "../../data/menu";
import MenuCard from "./MenuCard";

function BevandeSection({ setCart, language }) {
  return (
    <section id="bevande">
      <h2>{language === "it" ? "Bevande" : "Drinks"}</h2>
      <div className="bevande-list">
        {bevande.map((item) => (
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

export default BevandeSection;
