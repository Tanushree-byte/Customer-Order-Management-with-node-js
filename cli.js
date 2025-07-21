const { Command } = require('commander');
const inquirer = require('inquirer');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

const program = new Command();

program
  .command('add-customer')
  .description('Add a new customer')
  .action(async () => {
    const answers = await inquirer.prompt([
      { name: 'name', message: 'Name:' },
      { name: 'email', message: 'Email:' },
      { name: 'city', message: 'City:' }
    ]);
    db.run(
      "INSERT INTO customers (name, email, city) VALUES (?, ?, ?)",
      [answers.name, answers.email, answers.city],
      (err) => {
        if (err) {
          console.error('❌ Error adding customer:', err.message);
        } else {
          console.log('✅ Customer added.');
        }
      }
    );
  });

program
  .command('add-order')
  .description('Add a new order')
  .action(async () => {
    db.all("SELECT id, name FROM customers", async (err, customers) => {
      if (err) {
        console.error('❌ Error fetching customers:', err.message);
        return;
      }

      const choices = customers.map(c => ({
        name: `${c.id} - ${c.name}`,
        value: c.id
      }));

      const answers = await inquirer.prompt([
        { type: 'list', name: 'customer_id', message: 'Select Customer:', choices },
        { name: 'product', message: 'Product:' },
        { name: 'quantity', message: 'Quantity:' },
        { name: 'price', message: 'Price:' },
        { name: 'date', message: 'Date (YYYY-MM-DD):' }
      ]);

      db.run(
        "INSERT INTO orders (customer_id, product, quantity, price, date) VALUES (?, ?, ?, ?, ?)",
        [answers.customer_id, answers.product, answers.quantity, answers.price, answers.date],
        (err) => {
          if (err) {
            console.error('❌ Failed to add order:', err.message);
          } else {
            console.log('✅ Order added.');
          }
        }
      );
    });
  });

program
  .command('view-orders')
  .description('View orders for a customer')
  .action(async () => {
    const answer = await inquirer.prompt([
      { name: 'customer_id', message: 'Customer ID:' }
    ]);

    db.all(
      "SELECT * FROM orders WHERE customer_id = ?",
      [answer.customer_id],
      (err, rows) => {
        if (err) {
          console.error('❌ Error fetching orders:', err.message);
        } else {
          console.table(rows);
        }
      }
    );
  });

program.parse(process.argv);
