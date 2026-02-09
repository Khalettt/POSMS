const express = require('express');
const cors = require('cors');
const pool = require('./src/db'); 
const authRoutes = require('./src/modules/auth');
const categories = require('./src/modules/category'); 
const customers = require('./src/modules/customer');
const expenseRoutes = require('./src/modules/expense');
const productRoutes = require('./src/modules/product');
const saleRoutes = require('./src/modules/sales');
const dashboardRoutes = require('./src/modules/dashboard');
const supplierRoutes = require('./src/modules/supplier');
const paymentsRoutes = require('./src/modules/payment');
const inventoryRoutes = require('./src/modules/inventory');
const reportsRoutes = require('./src/modules/reports');
const userRoutes = require('./src/modules/users');
const audit_logsRoutes = require('./src/modules/auditlogs');
const settingsRoutes = require('./src/modules/settings');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/categories', categories);
app.use('/api/customers', customers);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', audit_logsRoutes);
app.use('/api/settings', settingsRoutes);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database-ka kuma xirmin:', err.message);
  } else {
    console.log('✅ Database Connected Successfully');
  }
});

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});