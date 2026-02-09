const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Todays Sales
    const todaySalesRes = await pool.query(
      "SELECT SUM(total_amount) FROM sales WHERE sale_date::date = $1 AND status = 'completed'",
      [today]
    );

    // 2. Revenue, Expenses, Customers, Products
    const revenueRes = await pool.query("SELECT SUM(total_amount) FROM sales WHERE status = 'completed'");
    const expensesRes = await pool.query("SELECT SUM(amount) FROM expenses");
    const productsRes = await pool.query("SELECT COUNT(*) FROM products WHERE is_active = true");
    const customersRes = await pool.query("SELECT COUNT(*) FROM customers");

    // 3. Low Stock (ka yar threshold-ka loo qabtay)
    const lowStockRes = await pool.query(
      "SELECT id, name, stock_quantity FROM products WHERE stock_quantity <= 10 AND is_active = true LIMIT 6"
    );

    // 4. Recent Sales
    const recentSalesRes = await pool.query(`
      SELECT s.id, s.invoice_number, s.total_amount, s.sale_date, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.sale_date DESC LIMIT 5
    `);

    // 5. Chart Data (Last 7 Days Sales)
    const chartDataRes = await pool.query(`
      SELECT TO_CHAR(sale_date, 'DD Mon') as date, SUM(total_amount) as amount
      FROM sales
      WHERE sale_date > NOW() - INTERVAL '7 days' AND status = 'completed'
      GROUP BY date, sale_date
      ORDER BY sale_date ASC
    `);

    res.json({
      stats: {
        todaySales: Number(todaySalesRes.rows[0].sum) || 0,
        totalRevenue: Number(revenueRes.rows[0].sum) || 0,
        totalExpenses: Number(expensesRes.rows[0].sum) || 0,
        totalProducts: Number(productsRes.rows[0].count),
        totalCustomers: Number(customersRes.rows[0].count),
        lowStockCount: lowStockRes.rows.length
      },
      lowStockProducts: lowStockRes.rows,
      recentSales: recentSalesRes.rows,
      salesChart: chartDataRes.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;