const sqlite3 = require('sqlite3').verbose();
const { faker } = require('@faker-js/faker');

const db = new sqlite3.Database('orders.db');

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS customers");
  db.run("DROP TABLE IF EXISTS orders");

  db.run(`CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    city TEXT
  )`);

  db.run(`CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product TEXT,
    quantity INTEGER,
    price REAL,
    date TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);

  const insertCustomer = db.prepare("INSERT INTO customers (name, email, city) VALUES (?, ?, ?)");
  for (let i = 0; i < 10; i++) {
    insertCustomer.run(faker.name.fullName(), faker.internet.email(), faker.location.city());
  }
  insertCustomer.finalize();

  const insertOrder = db.prepare(
    "INSERT INTO orders (customer_id, product, quantity, price, date) VALUES (?, ?, ?, ?, ?)"
  );
  for (let i = 0; i < 50; i++) {
    insertOrder.run(
      faker.number.int({ min: 1, max: 10 }),
      faker.commerce.product(),
      faker.number.int({ min: 1, max: 5 }),
      faker.number.float({ min: 10, max: 100, precision: 0.01 }),
      faker.date.recent({ days: 365 }).toISOString().split('T')[0]
    );
  }
  insertOrder.finalize();
});

db.close(() => console.log("📦 Database created and filled with fake data."));
