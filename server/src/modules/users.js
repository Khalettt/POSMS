const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. Hel dhammaan shaqaalaha (Manager Only)
// Waxaan ku darnay authMiddleware iyo authorizeManager
router.get('/', authMiddleware, authorizeManager, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. Ku dar shaqaale cusub (Manager Only)
router.post('/', authMiddleware, authorizeManager, async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;
  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'Email-kan hore ayaa loo diiwangeliyey' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, role`,
      [full_name, email, hashedPassword, role || 'cashier', phone]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.patch('/:id/approve', authMiddleware, authorizeManager, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [id]);
    res.json({ message: 'Shaqaalaha waa la aqbalay (User Approved)' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. Tirtir shaqaale (Manager Only)
router.delete('/:id', authMiddleware, authorizeManager, async (req, res) => {
  try {
    const { id } = req.params;

    // Ha u oggolaan qofka inuu naftiisa tirtiro
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Ma tirtiri kartid naftaada adigoo nidaamka ku dhex jira.' });
    }

    // Hubi inuu jiro user-ka la tirtirayo
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Shaqaalaha lama helin' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

