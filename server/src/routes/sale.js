const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const { items, subtotal, tax_amount, discount_amount, total_amount, customer_id } = req.body;
  const client = await pool.connect(); // Waxaan isticmaaleynaa Transaction

  try {
    await client.query('BEGIN'); // Bilow iibka

    // 1. Geli iibka miiska Sales
    const invoiceNumber = 'INV-' + Date.now();
    const saleResult = await client.query(
      `INSERT INTO sales (invoice_number, customer_id, subtotal, tax_amount, discount_amount, total_amount, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [invoiceNumber, customer_id || null, subtotal, tax_amount, discount_amount, total_amount, req.user.id]
    );

    const saleId = saleResult.rows[0].id;

    // 2. Wareeji alaabta (Items) mid mid
    for (const item of items) {
      // Geli sale_items
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.id, item.quantity, item.price, (item.price * item.quantity)]
      );

      // KA JAR STOCK-GA: Halkan ayay alaabtu kaga go'aysaa Products
      const productCheck = await client.query('SELECT stock_quantity FROM products WHERE id = $1', [item.id]);
      if (productCheck.rows[0].stock_quantity < item.quantity) {
        throw new Error(`Alaabta ${item.name} stock-geedu kuuma filna!`);
      }

      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }

    await client.query('COMMIT'); // Dhameystir haddii wax walba saxsan yihiin
    res.status(201).json({ message: 'Iibku waa guulaystay!', saleId });

  } catch (err) {
    await client.query('ROLLBACK'); // Ka noqo haddii qalad dhaco
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Cillad ayaa dhacday' });
  } finally {
    client.release();
  }
});

module.exports = router;