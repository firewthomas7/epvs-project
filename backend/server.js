const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. LOCAL DATABASE CONNECTION
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'epvs_db',
  password: 'YOUR_PGADMIN_PASSWORD', // <-- CHANGE THIS TO YOUR PASSWORD
  port: 5432,
});

// Check Connection
pool.connect((err) => {
  if (err) {
    console.error('❌ DATABASE CONNECTION ERROR:', err.stack);
  } else {
    console.log('✅ CONNECTED TO LOCAL POSTGRESQL');
  }
});

// --- ROUTES ---

// SIGN UP
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);
    res.json({ message: "User created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error: Email might already exist" });
  }
});

// SIGN IN
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      res.json({ message: "Welcome back!", user: result.rows[0].email });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signin" });
  }
});

// VERIFY & SAVE PAYMENT
app.post('/verify-payment', async (req, res) => {
  const { bankCode } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (bank_code) VALUES ($1) RETURNING *', 
      [bankCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

// GET TRANSACTION HISTORY
app.get('/transactions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY verified_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

// START SERVER
app.listen(5000, () => {
  console.log(`🚀 EPVS Backend running on http://localhost:5000`);
});
