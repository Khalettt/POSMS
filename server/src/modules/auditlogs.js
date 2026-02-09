const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// 1. HEL DHAMMAAN LOGS-KA (Manager Only)
router.get('/', authMiddleware, authorizeManager, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.full_name as user_name, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 500
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Audit Log Fetch Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * HELPER FUNCTION: createAuditLog
 * Tan looma dhisin route ahaan, laakiin waxaa loogu talagalay in lagu dhex isticmaalo
 * modules-ka kale (sida Products.js ama Sales.js) si loo qoro taariikhda.
 */
const createAuditLog = async (userId, action, table, targetId, details, ip) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, table, targetId, JSON.stringify(details), ip]
    );
  } catch (err) {
    console.error('Logging System Error:', err.message);
  }
};

module.exports = router;