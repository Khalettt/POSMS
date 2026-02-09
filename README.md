POS Management System (PostgreSQL)

POS Management System waa system dhameystiran oo lagu maareeyo:

Iibka (Sales)

Alaabta (Products & Inventory)

Lacagaha (Payments)

Isticmaalayaasha (Users & Roles)

Kharashaadka (Expenses)

Diiwaanka amniga (Audit Logs)

System-kan waxaa lagu dhisay Pure PostgreSQL (backend-ready), kuna habboon:

🏪 Shops

💊 Pharmacy

🍽️ Restaurants

🧾 Retail POS

🚀 Features
👤 User Management

Roles: manager, cashier

Active / inactive users

User approval (is_approved)

Password storage (hashed)

🛍️ Products & Inventory

Categories & suppliers

SKU unique

Stock tracking

Low stock alert

Inventory logs (in / out / sale / return / adjustment)

🧾 Sales

Invoice system

Multiple sale items

Discounts & tax

Sale status:

pending

completed

cancelled

refunded

💰 Payments

Payment methods:

cash

card

mobile

bank_transfer

evc

Payment reference support

Linked to sales

📉 Expenses

Expense categories

Expense reports

Profit calculation

🔐 Audit Logs

Track:

who did what

on which table

when

Security & accountability

⚙️ Settings

Store name

Currency

VAT %

Receipt footer

🧱 Database Structure
ENUMS

app_role

payment_method

sale_status

inventory_log_type

Tables

users

categories

suppliers

products

customers

sales

sale_items

payments

inventory_logs

expenses

audit_logs

settings

🔑 Roles & Permissions
Role	Permissions
Manager	Full access (users, products, sales, reports, settings)
Cashier	Sales, payments, view products

⚠️ Only one manager is recommended (can be enforced via logic / index).

🛠️ Installation
1️⃣ Requirements

PostgreSQL 13+

pgcrypto extension enabled

2️⃣ Setup Database
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


Run the full SQL schema file:

psql -U postgres -d pos_db -f pos_schema.sql

👤 Default Users
Manager:
Email: manager@posms.com
Password: 123456
Role: manager


⚠️ Change password immediately in production

📊 Helper Queries
Total Sales
SELECT SUM(total_amount)
FROM sales
WHERE status = 'completed';

Total Expenses
SELECT SUM(amount)
FROM expenses;

Profit
SELECT
  (SELECT SUM(total_amount) FROM sales WHERE status = 'completed')
  -
  (SELECT SUM(amount) FROM expenses)
AS profit;

🔄 Triggers

Auto update updated_at on:

users

products

categories

customers

suppliers

sales

expenses

🔐 Security Notes

Always hash passwords (bcrypt)

Use audit_logs for all critical actions

Restrict cashier permissions

Do not expose database directly to frontend

🧠 Future Improvements

Reports & analytics views

Soft delete support

Multi-store support

Role-based row-level security (RLS)

Backend API (Node.js / Supabase)

Frontend (React + ShadCN)

📄 License

MIT License – free to use, modify, and distribute.

🤝 Author

Developer: Khalid Updt
