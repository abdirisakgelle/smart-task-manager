require('dotenv').config();
const mysql = require('mysql2/promise');

// Read-Write pool for transactions and write operations
const rwPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER || process.env.DB_USER_RW,
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+03:00', // Somalia timezone (UTC+3)
  // This will store timestamps in Somalia time
  // Note: Only use this if your app is only for Somalia users
});

// Read-Only pool for queries
const roPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER_RO || process.env.DB_USER,
  password: process.env.DB_PASS_RO || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+03:00',
});

// Default export for backward compatibility
module.exports = rwPool;

// Named exports for specific use cases
module.exports.rwPool = rwPool;
module.exports.roPool = roPool; 