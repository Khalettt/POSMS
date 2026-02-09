const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

// 1. GET ALL LOGS - Soo qaad dhammaan dhaqdhaqaaqa stock-ga
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, p.name as product_name, u.full_name as operator_name 
      FROM inventory_logs l
      JOIN products p ON l.product_id = p.id
      LEFT JOIN users u ON l.operated_by = u.id
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. ADJUST STOCK - Beddelidda stock-ga iyo diiwaangalinta log-ga
router.post('/adjust', authMiddleware, async (req, res) => {
  const { product_id, quantity_change, change_type, notes } = req.body;
  const operated_by = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hel xogta hadda ee alaabta
    const productRes = await client.query('SELECT stock_quantity FROM products WHERE id = $1', [product_id]);
    const previous_quantity = productRes.rows[0].stock_quantity;
    const new_quantity = previous_quantity + parseInt(quantity_change);

    // 1. Cusboonaysii Product Stock
    await client.query(
      'UPDATE products SET stock_quantity = $1 WHERE id = $2',
      [new_quantity, product_id]
    );

    // 2. Diiwaangali Log-ga
    await client.query(
      `INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_quantity, new_quantity, notes, operated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [product_id, change_type, quantity_change, previous_quantity, new_quantity, notes, operated_by]
    );

    await client.query('COMMIT');
    res.json({ message: 'Stock updated successfully', new_quantity });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error adjusting stock' });
  } finally {
    client.release();
  }
});

module.exports = router;