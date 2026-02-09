const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. GET ALL EXPENSES (Sii wad xogta dhammaan kharashaadka)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.full_name as author_name 
      FROM expenses e 
      LEFT JOIN users u ON e.created_by = u.id 
      ORDER BY e.expense_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. CREATE EXPENSE (Diiwaangeli kharash cusub)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, amount, category, expense_date } = req.body;
  const created_by = req.user.id; // Token-ka ayaan ka helnaa qofka qoraya

  if (!title || !amount) {
    return res.status(400).json({ message: 'Title and Amount are required' });
  }

  try {
    const newExpense = await pool.query(
      `INSERT INTO expenses (title, description, amount, category, expense_date, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description || null, amount, category || 'Other', expense_date, created_by]
    );
    res.status(201).json(newExpense.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. DELETE EXPENSE (Manager kaliya ayaa tirtiri kara kharashaadka)
router.delete('/:id', authMiddleware, authorizeManager, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully by Manager' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;