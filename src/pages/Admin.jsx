import { useState } from "react";
import { useEffect } from "react";
import "./Admin.css";

function Admin() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(
    sessionStorage.getItem("adminToken") || "",
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("http://localhost:3000/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Errore durante l'accesso.");
        return;
      }

      sessionStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setPassword("");
    } catch {
      setLoginError("Impossibile collegarsi al server.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    setToken("");
    setOrders([]);
  };

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (response.status === 401) {
          sessionStorage.removeItem("adminToken");
          setToken("");
          setOrders([]);
          return null;
        }
        if (!response.ok) {
          throw new Error("Errore durante il caricamento degli ordini.");
        }

        return response.json();
      })
      .then((data) => {
        if (data) {
          setOrders(data.filter((order) => order.status !== "completed"));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);
  const handleReady = async (id) => {
    await fetch(`http://localhost:3000/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "ready",
      }),
    });

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === id ? { ...order, status: "ready" } : order,
      ),
    );
  };

  const handleDelivered = async (id) => {
    await fetch(`http://localhost:3000/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "completed",
      }),
    });

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== id),
    );
  };

  if (!token) {
    return (
      <div className="admin-container">
        <form className="admin-login" onSubmit={handleLogin}>
          <h1>Accesso Admin</h1>

          <label htmlFor="admin-password">Password</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Inserisci la password"
            required
          />

          <button type="submit">Accedi</button>

          {loginError && <p role="alert">{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Gestione Ordini</h1>
      <div className="admin-actions">
        <button className="btn-logout" onClick={handleLogout}>
          Esci
        </button>
      </div>
      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <h2>Ordine #{order.orderNumber}</h2>
            {JSON.parse(order.cart).map((item) => (
              <div key={item.id}>
                <p>
                  {item.name.it}
                  {item.size && ` - ${item.size}`}
                  {" × "}
                  {item.quantity}
                </p>
              </div>
            ))}
            <p className="order-total">
              <strong>
                Totale:{" "}
                {JSON.parse(order.cart)
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0,
                  )
                  .toFixed(2)}{" "}
                €
              </strong>
            </p>
            <p>Nome: {order.name}</p>
            <p>
              {" "}
              Ritiro:{" "}
              {order.deliveryType === "pickup"
                ? "Asporto"
                : "Consegna a domicilio"}{" "}
            </p>{" "}
            {order.deliveryType === "delivery" && (
              <p>
                {" "}
                Indirizzo: {order.address}, {order.houseNumber},{" "}
                {order.zipCode}{" "}
              </p>
            )}{" "}
            <p>
              {" "}
              Pagamento:{" "}
              {order.paymentMethod === "cash"
                ? "Contanti"
                : order.paymentMethod === "paypal"
                  ? "PayPal"
                  : order.paymentMethod === "card"
                    ? "Carta"
                    : order.paymentMethod}
            </p>
            <p>Telefono: {order.phone}</p>
            <p className={`order-status ${order.status}`}>
              Stato:{" "}
              {order.status === "received"
                ? "IN PREPARAZIONE"
                : order.status === "ready"
                  ? "PRONTO"
                  : "COMPLETATO"}
            </p>
            {order.status === "received" && (
              <button
                className="btn-ready"
                onClick={() => handleReady(order.id)}
              >
                PRONTO{" "}
              </button>
            )}
            {order.status === "ready" && (
              <button
                className="btn-delivered"
                onClick={() => handleDelivered(order.id)}
              >
                CONSEGNATO
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default Admin;
