const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. GET ALL CUSTOMERS - Soo qaado dhamaan macaamiisha
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. CREATE CUSTOMER - Diwaangeli macamiil cusub
router.post('/', async (req, res) => {
  const { name, email, phone, address, notes } = req.body;
  try {
    const newCustomer = await pool.query(
      `INSERT INTO customers (name, email, phone, address, notes) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email || null, phone || null, address || null, notes || null]
    );
    res.status(201).json(newCustomer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. DELETE CUSTOMER - Masax macamiil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;