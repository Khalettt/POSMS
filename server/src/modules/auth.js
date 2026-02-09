const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// SIGN UP
router.post('/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    // Haddii role = manager → hubi inuu jiro
    if (role === 'manager') {
      const check = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'manager'"
      );
      if (Number(check.rows[0].count) > 0) {
        return res.status(400).json({ message: 'Manager hore ayuu u jiraa' });
      }
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, full_name, email, role`,
      [fullName, email, hash, role || 'cashier']
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SIGN IN
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ message: 'Invalid credentials' });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match)
    return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;
