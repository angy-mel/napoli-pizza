const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("orders.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    deliveryType TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    cart TEXT NOT NULL
  )
`);
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_orderNumber
  ON orders(orderNumber)
`);
module.exports = db;
