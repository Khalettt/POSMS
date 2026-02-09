const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. GET ALL CATEGORIES (Cashier & Manager waa u furan tahay)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id)::int as product_count 
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. CREATE CATEGORY (Manager Only)
router.post('/', authMiddleware, authorizeManager, async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategory = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.json(newCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. UPDATE CATEGORY (Manager Only)
router.put('/:id', authMiddleware, authorizeManager, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. DELETE CATEGORY (Manager Only)
router.delete('/:id', authMiddleware, authorizeManager, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;