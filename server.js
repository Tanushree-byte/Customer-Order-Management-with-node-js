const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('orders.db');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🌐 Home - List all orders with customer info
app.get('/', (req, res) => {
  db.all(`
    SELECT customers.name, customers.city, orders.product, orders.quantity, orders.price, orders.date
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    ORDER BY orders.date DESC
  `, (err, rows) => {
    if (err) return res.send('❌ Error: ' + err.message);
    res.render('customer', { customers: rows });
  });
});

// 🧍‍♂️ Show Add Customer form
app.get('/add-customer', (req, res) => {
  res.render('addCustomer');
});

// ✅ Handle Add Customer form submit
app.post('/add-customer', (req, res) => {
  const { name, email, city } = req.body;
  if (!name || !email || !city) {
    return res.send("❌ Please fill all customer fields.");
  }

  db.run(
    "INSERT INTO customers (name, email, city) VALUES (?, ?, ?)",
    [name, email, city],
    (err) => {
      if (err) return res.send('❌ Error: ' + err.message);
      res.redirect('/');
    }
  );
});

// 📦 Show Add Order form with dropdown of customers
app.get('/add-order', (req, res) => {
  db.all("SELECT id, name FROM customers", (err, customers) => {
    if (err) return res.send('❌ Error: ' + err.message);
    res.render('addOrder', { customers });
  });
});

// ✅ Handle Add Order form submit
app.post('/add-order', (req, res) => {
  const { customer_id, product, quantity, price, date } = req.body;

  if (!customer_id || !product || !quantity || !price || !date) {
    return res.send("❌ Please fill all order fields.");
  }

  db.run(
    "INSERT INTO orders (customer_id, product, quantity, price, date) VALUES (?, ?, ?, ?, ?)",
    [customer_id, product, quantity, price, date],
    (err) => {
      if (err) return res.send('❌ Error: ' + err.message);
      res.redirect('/');
    }
  );
});

// ✅ Catch-all route for undefined paths
app.use((req, res) => {
  res.status(404).send("404 Not Found: The page you're looking for does not exist.");
});

// Start the server
app.listen(3000, () => {
  console.log('✅ Server running at: http://localhost:3000');
});
