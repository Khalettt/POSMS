const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. GET SETTINGS (Public/All Users)
// Tani waa u furan tahay qof kasta si rasiidka ama terminal-ka loogu muujiyo magaca dukaanka
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. UPDATE SETTINGS (Manager Only)
router.post('/', authMiddleware, authorizeManager, async (req, res) => {
  const { 
    store_name, address, phone, email, 
    currency, vat_percent, receipt_footer 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO settings (id, store_name, address, phone, email, currency, vat_percent, receipt_footer)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
       store_name = $1, 
       address = $2, 
       phone = $3, 
       email = $4, 
       currency = $5, 
       vat_percent = $6, 
       receipt_footer = $7, 
       updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        store_name, 
        address, 
        phone, 
        email, 
        currency || '$', 
        Number(vat_percent) || 0, 
        receipt_footer
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

module.exports = router;