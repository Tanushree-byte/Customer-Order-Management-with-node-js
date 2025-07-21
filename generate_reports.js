const sqlite3 = require('sqlite3').verbose();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

const db = new sqlite3.Database('orders.db');

// Step 1: Export to CSV
db.all(`
  SELECT customers.name AS customer, customers.city, orders.product, orders.quantity, orders.price, orders.date
  FROM orders
  JOIN customers ON orders.customer_id = customers.id
`, async (err, rows) => {
  if (err) {
    console.error('❌ Error fetching data:', err.message);
    return;
  }

  const csvWriter = createCsvWriter({
    path: 'report.csv',
    header: [
      { id: 'customer', title: 'Customer' },
      { id: 'city', title: 'City' },
      { id: 'product', title: 'Product' },
      { id: 'quantity', title: 'Quantity' },
      { id: 'price', title: 'Price' },
      { id: 'date', title: 'Date' }
    ]
  });

  await csvWriter.writeRecords(rows);
  console.log('✅ CSV report generated as report.csv');

  // Step 2: Revenue chart by city
  db.all(`
    SELECT customers.city AS city, SUM(orders.quantity * orders.price) AS revenue
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    GROUP BY customers.city
  `, async (err2, result) => {
    if (err2) {
      console.error('❌ Error generating chart:', err2.message);
      return;
    }

    const width = 800;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
      type: 'bar',
      data: {
        labels: result.map(r => r.city),
        datasets: [{
          label: 'Revenue by City',
          data: result.map(r => r.revenue),
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Revenue by City'
          }
        }
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync('chart.png', imageBuffer);
    console.log('📊 Chart saved as chart.png');

    db.close();
  });
});
