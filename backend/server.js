const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config(); // Load secrets from .env if you have one

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // <--- THIS LINE IS THE FIX
  }
});


// Check if Database is connected
pool.connect((err) => {
  if (err) {
    console.error('❌ DATABASE CONNECTION ERROR:', err.stack);
  } else {
    console.log('✅ CONNECTED TO POSTGRESQL (epvs_db)');
  }
});

// --- ROUTES ---

// A. HEALTH CHECK
app.get('/', (req, res) => {
  res.send("EPVS Backend is running perfectly!");
});

// B. SIGN UP
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

// C. SIGN IN
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

// D. VERIFY & SAVE PAYMENT
app.post('/verify-payment', async (req, res) => {
  const { bankCode } = req.body;
  try {
    // This saves the code into your 'transactions' table
    const result = await pool.query(
      'INSERT INTO transactions (bank_code) VALUES ($1) RETURNING *', 
      [bankCode]
    );
    console.log("✅ New Payment Saved:", bankCode);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB SAVE ERROR:", err.message);
    res.status(500).json({ message: "Database Error: Could not save payment" });
  }
});

// E. GET TRANSACTION HISTORY
app.get('/transactions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY verified_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB FETCH ERROR:", err.message);
    res.status(500).json({ message: "Database Error: Could not load history" });
  }
});

// START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 EPVS Server running on http://localhost:${PORT}`);
});
