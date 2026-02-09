const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. GET ALL PRODUCTS (Manager & Cashier)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
} );

// 2. CREATE PRODUCT (Manager Only)
router.post('/', authMiddleware, authorizeManager, async (req, res) => {
  const { 
    name, description, sku, category_id, price, 
    cost_price, stock_quantity, low_stock_threshold, is_active 
  } = req.body;

  try {
    const newProduct = await pool.query(
      `INSERT INTO products (
        name, description, sku, category_id, price, 
        cost_price, stock_quantity, low_stock_threshold, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description || null, sku || null, category_id || null, price, 
       cost_price || null, stock_quantity || 0, low_stock_threshold || 10, 
       is_active, req.user.id]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. DELETE PRODUCT (Manager Only)
router.delete('/:id', authMiddleware, authorizeManager, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Alaabtaan lama helin.' });
    res.json({ message: 'Alaabta waa la tirtiray!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;