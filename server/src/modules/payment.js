const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

// 1. HEL DHAMMAAN LACAGAHA (GET ALL PAYMENTS)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.invoice_number 
      FROM payments p
      LEFT JOIN sales s ON p.sale_id = s.id
      ORDER BY p.payment_date DESC
      LIMIT 1000
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Payment Fetch Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. DIIWANGELI LACAG CUSUB (CREATE PAYMENT)
// Waxaa la wacaa marka POS-ka iibka lagu dhameeyo
router.post('/', authMiddleware, async (req, res) => {
  const { sale_id, amount, payment_method, reference_number } = req.body;
  try {
    const newPayment = await pool.query(
      `INSERT INTO payments (sale_id, amount, payment_method, reference_number) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sale_id, amount, payment_method || 'cash', reference_number]
    );
    res.status(201).json(newPayment.rows[0]);
  } catch (err) {
    console.error('Create Payment Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;