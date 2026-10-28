const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("orders.db");

db.exec(`  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    houseNumber TEXT,
    zipCode TEXT,
    deliveryType TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    cart TEXT NOT NULL,
    orderNumber INTEGER UNIQUE,
    status TEXT NOT NULL DEFAULT 'received',
    paymentStatus TEXT NOT NULL DEFAULT 'pending',
    stripeSessionId TEXT
  )`);

const columns = db.prepare("PRAGMA table_info(orders)").all();
const columnNames = columns.map((column) => column.name);

if (!columnNames.includes("paymentStatus")) {
  db.exec(`     ALTER TABLE orders
    ADD COLUMN paymentStatus TEXT NOT NULL DEFAULT 'pending'
  `);
}

if (!columnNames.includes("stripeSessionId")) {
  db.exec(`     ALTER TABLE orders
    ADD COLUMN stripeSessionId TEXT
  `);
}

db.exec(`  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_orderNumber
  ON orders(orderNumber)`);

module.exports = db;
