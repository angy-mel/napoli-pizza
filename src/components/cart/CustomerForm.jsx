function CustomerForm({ language, deliveryType }) {
  return (
    <div className="delivery-form">
      <h3> {language === "it" ? "Dati per l'ordine" : "Order details"}</h3>
      <input
        type="text"
        name="name"
        placeholder={language === "it" ? "Nome" : "Name"}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder={language === "it" ? "Telefono" : "Phone"}
        required
        pattern="[0-9]{10}"
        minLength={10}
        maxLength={10}
        inputMode="numeric"
        onChange={(e) => {
          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
        }}
      />
      {deliveryType === "delivery" && (
        <>
          <input
            type="text"
            name="address"
            placeholder={language === "it" ? "Indirizzo" : "Address"}
            required
          />
          <input
            type="text"
            name="houseNumber"
            placeholder={language === "it" ? "Numero civico" : "House number"}
            required
          />
          <input
            type="text"
            name="zipCode"
            placeholder={language === "it" ? "CAP" : "ZIP code"}
            required
          />
        </>
      )}
    </div>
  );
}
export default CustomerForm;
