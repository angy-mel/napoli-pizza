require("dotenv").config();
const menu = require("./menu");

const express = require("express");
const cors = require("cors");
const db = require("./database");
const Stripe = require("stripe");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors());

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error("Stripe webhook signature verification failed.");
      return res.status(400).send("Invalid webhook signature.");
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        if (session.payment_status === "paid") {
          db.prepare(
            `
            UPDATE orders
            SET paymentStatus = 'paid'
            WHERE stripeSessionId = ?
          `,
          ).run(session.id);
        }
      }

      return res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook processing failed.");
      return res.status(500).send("Webhook processing failed.");
    }
  },
);

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

function validateCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Il carrello è vuoto.");
  }

  let total = 0;

  const lineItems = cart.map((item) => {
    if (
      !item ||
      typeof item.id !== "string" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      throw new Error("Articolo non valido.");
    }

    const product = menu[item.id];

    if (!product) {
      throw new Error("Prodotto non trovato.");
    }

    const size = product.standard ? "standard" : item.size;

    const price = product[size];

    if (typeof price !== "number") {
      throw new Error("Formato o dimensione non valida.");
    }

    total += price * item.quantity;

    const productName = `${item.id}${size === "standard" ? "" : ` (${size})`}`;

    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: productName,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: item.quantity,
    };
  });

  if (!Number.isSafeInteger(Math.round(total * 100)) || total <= 0) {
    throw new Error("Importo non valido.");
  }

  return { lineItems, total };
}

app.post("/orders", async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      houseNumber,
      zipCode,
      deliveryType,
      paymentMethod,
      cart,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !/^\d{10}$/.test(phone) ||
      !["cash", "card"].includes(paymentMethod) ||
      !["delivery", "pickup"].includes(deliveryType)
    ) {
      return res.status(400).json({
        message: "Dati dell'ordine non validi.",
      });
    }

    const { lineItems, total } = validateCart(cart);

    const orderNumber = generateOrderNumber();

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
        orderNumber,
        paymentStatus
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
      name.trim(),
      phone,
      address || "",
      houseNumber || "",
      zipCode || "",
      deliveryType,
      paymentMethod,
      JSON.stringify(cart),
      orderNumber,
      "pending",
    );

    if (paymentMethod === "cash") {
      return res.json({
        message: "Order received!",
        orderId: orderNumber,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${CLIENT_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/?payment=cancelled`,
      client_reference_id: String(result.lastInsertRowid),
      metadata: {
        orderNumber: String(orderNumber),
      },
    });

    db.prepare(
      `
      UPDATE orders
      SET stripeSessionId = ?
      WHERE id = ?
    `,
    ).run(session.id, result.lastInsertRowid);

    return res.json({
      message: "Order created. Continue to payment.",
      orderId: orderNumber,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Order creation failed:", error.message);

    return res.status(400).json({
      message: "Impossibile creare l'ordine. Controlla i dati e riprova.",
    });
  }
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
