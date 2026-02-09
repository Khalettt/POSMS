const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. HEL DHAMMAAN SUPPLIERS-KA
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. DIIWANGELI SUPPLIER CUSUB
router.post('/', authMiddleware, async (req, res) => {
  const { name, contact_person, email, phone, address, notes } = req.body;
  
  if (!name) return res.status(400).json({ message: 'Magaca Supplier-ka waa qasab' });

  try {
    const newSupplier = await pool.query(
      `INSERT INTO suppliers (name, contact_person, email, phone, address, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, contact_person, email, phone, address, notes]
    );
    res.status(201).json(newSupplier.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. TIRTIR SUPPLIER (Manager Only)
router.delete('/:id', authMiddleware, authorizeManager, async (req, res) => {
  try {
    // Hubi haddii supplier-kan alaab ay ku xirantahay ka hor intaan la tirtirin
    const checkProducts = await pool.query('SELECT id FROM products WHERE supplier_id = $1 LIMIT 1', [req.params.id]);
    
    if (checkProducts.rows.length > 0) {
      return res.status(400).json({ message: 'Supplier-kan lama tirtiri karo sababtoo ah alaab ayaa ku xiran.' });
    }

    await pool.query('DELETE FROM suppliers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Supplier-ka waa la tirtiray' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;