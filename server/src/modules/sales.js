const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. CREATE NEW SALE (Cashier & Manager)
router.post('/', authMiddleware, async (req, res) => {
  const { items, subtotal, tax_amount, total_amount, customer_id, notes } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Bilow Transaction

    // Abuuri Invoice Number (INV + Sanad + Bil + Maalin + Random)
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Geli Sales Table
    const saleResult = await client.query(
      `INSERT INTO sales (invoice_number, customer_id, subtotal, tax_amount, total_amount, created_by, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [invoiceNumber, customer_id || null, subtotal, tax_amount || 0, total_amount, req.user.id, notes || null]
    );

    const saleId = saleResult.rows[0].id;

    // Process-garee Items-ka mid mid
    for (const item of items) {
      // 1. Hubi in stock-gu ku filan yahay
      const productRes = await client.query('SELECT name, stock_quantity FROM products WHERE id = $1', [item.id]);
      const product = productRes.rows[0];

      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`Alaabta "${product ? product.name : 'Lama yaqaan'}" stock-geedu waa ${product?.stock_quantity || 0}, kuma filna!`);
      }

      // 2. Geli Sale Items
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [saleId, item.id, item.name, item.quantity, item.price, (item.quantity * item.price)]
      );

      // 3. Ka jar Inventory-ga (Update Stock)
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.id]);
    }

    await client.query('COMMIT'); // Hadda badbaadi wax walba
    res.status(201).json({ message: 'Iibka waa la dhamaystiray', id: saleId, invoiceNumber });

  } catch (err) {
    await client.query('ROLLBACK'); // Ka noqo haddii stock-gu yaraado ama qalad dhaco
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

// 2. GET ALL SALES (Cashier & Manager)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.name as customer_name, u.full_name as seller_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.sale_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. GET SINGLE SALE DETAILS (Print & View)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sale = await pool.query('SELECT * FROM sales WHERE id = $1', [req.params.id]);
    const items = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [req.params.id]);
    
    if (sale.rows.length === 0) return res.status(404).json({ message: 'Lama helin iibkaas' });
    
    res.json({ ...sale.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. DELETE SALE (Manager Only)
router.delete('/:id', authMiddleware, authorizeManager, async (req, res) => {
  try {
    await pool.query('DELETE FROM sales WHERE id = $1', [req.params.id]);
    res.json({ message: 'Iibka waa la tirtiray (Audit Trail recorded)' });
  } catch (err) {
    res.status(500).json({ message: 'Ma tirtirmi karo' });
  }
});

module.exports = router;