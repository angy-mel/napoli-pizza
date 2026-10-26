require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./database");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Napoli Pizza server is running!");
});

function generateOrderNumber() {
  let orderNumber;
  do {
    orderNumber = 1000 + Math.floor(Math.random() * 9000);
  } while (
    db.prepare("SELECT id FROM orders WHERE orderNumber = ?").get(orderNumber)
  );
  return orderNumber;
}

app.post("/orders", (req, res) => {
  const order = req.body;
  if (!/^\d{10}$/.test(order.phone)) {
    return res.status(400).json({
      message: "Il numero di telefono deve essere valido.",
    });
  }

  const statement = db.prepare(`
    INSERT INTO orders (
      name,
      phone,
      address,
      houseNumber,
      zipCode,
      deliveryType,
      paymentMethod,
      cart,
      orderNumber
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const orderNumber = generateOrderNumber();
  console.log("GENERATED ORDER NUMBER:", orderNumber);
  const result = statement.run(
    order.name,
    order.phone,
    order.address,
    order.houseNumber,
    order.zipCode,
    order.deliveryType,
    order.paymentMethod,
    JSON.stringify(order.cart),
    orderNumber,
  );
  console.log("INSERT RESULT:", result);
  const savedOrder = db
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(result.lastInsertRowid);

  console.log("SAVED ORDER:", savedOrder);
  console.log(order);

  res.json({
    message: "Order received!",
    orderId: orderNumber,
  });
});

app.get("/orders", requireAdmin, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders").all();

  res.json(orders);
});

app.get("/orders/:id", requireAdmin, (req, res) => {
  const id = req.params.id;

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);

  res.json(order);
});

app.patch("/orders/:id", requireAdmin, (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);

  res.json({
    message: "Order status updated!",
  });
});

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Autenticazione richiesta.",
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({
        message: "Accesso negato.",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      message: "Sessione non valida o scaduta.",
    });
  }
}

app.post("/admin/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        message: "Inserisci la password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Password non corretta.",
      });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      message: "Accesso effettuato!",
      token,
    });
  } catch (error) {
    console.error("Errore durante il login:", error);

    res.status(500).json({
      message: "Errore interno del server.",
    });
  }
});

app.get("/track-order/:orderNumber", (req, res) => {
  const { orderNumber } = req.params;
  if (!/^\d{4}$/.test(orderNumber)) {
    return res.status(404).json({
      message: "Ordine non trovato.",
    });
  }
  const order = db
    .prepare("SELECT status FROM orders WHERE orderNumber = ?")
    .get(orderNumber);
  if (!order || order.status === "completed") {
    return res.status(404).json({
      message: "Ordine non trovato.",
    });
  }
  res.json({
    status: order.status,
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
