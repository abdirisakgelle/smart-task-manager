require('dotenv').config({ path: './.env.local' });
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Create database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+03:00',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ 
      ok: true, 
      db: "up", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db_host: process.env.DB_HOST,
      db_port: process.env.DB_PORT
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db_host: process.env.DB_HOST,
      db_port: process.env.DB_PORT
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Test server is running!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
