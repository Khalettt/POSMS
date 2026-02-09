const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, authorizeManager } = require('../middleware/authMiddleware');

// GET DASHBOARD SUMMARY (Manager Only)
router.get('/dashboard-summary', authMiddleware, authorizeManager, async (req, res) => {
  try {
    // 1. Wadarta Iibka iyo Cashuurta
    const salesRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax
      FROM sales
    `);

    // 2. Wadarta Kharashyada (Expenses)
    const expenseRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses
    `);

    // 3. Iibka Billaha ah (Monthly Sales Chart)
    const monthlySales = await pool.query(`
      SELECT 
        TO_CHAR(sale_date, 'Mon') as month,
        SUM(total_amount) as amount
      FROM sales
      WHERE sale_date > CURRENT_DATE - INTERVAL '1 year'
      GROUP BY TO_CHAR(sale_date, 'Mon'), EXTRACT(MONTH FROM sale_date)
      ORDER BY EXTRACT(MONTH FROM sale_date)
    `);

    // 4. 5-ta Alaab ee ugu iibka badan (Top Selling Products)
    const topProducts = await pool.query(`
      SELECT p.name, SUM(si.quantity) as total_qty
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.name
      ORDER BY total_qty DESC 
      LIMIT 5
    `);

    const revenue = parseFloat(salesRes.rows[0].total_revenue);
    const expenses = parseFloat(expenseRes.rows[0].total_expenses);
    const tax = parseFloat(salesRes.rows[0].total_tax);

    const summary = {
      revenue,
      expenses,
      tax,
      profit: revenue - expenses,
      monthlyData: monthlySales.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount)
      })),
      topProducts: topProducts.rows.map(row => ({
        ...row,
        total_qty: parseInt(row.total_qty)
      }))
    };

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

module.exports = router;