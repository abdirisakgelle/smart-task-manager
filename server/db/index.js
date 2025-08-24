const mysql = require('mysql2/promise');
require('dotenv').config();

// Read env with fallbacks for compatibility
const {
  DB_HOST,
  DB_PORT = 3306,
  DB_USER,
  DB_PASS,
  DB_PASSWORD, // compatibility with existing config
  DB_NAME,
  DB_USER_RO,
  DB_PASS_RO
} = process.env;

const common = {
  host: DB_HOST,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+03:00'
};

const poolRW = mysql.createPool({
  ...common,
  user: DB_USER,
  password: DB_PASS || DB_PASSWORD,
  database: DB_NAME,
});

const poolRO = mysql.createPool({
  ...common,
  user: DB_USER_RO || DB_USER,
  password: DB_PASS_RO || DB_PASS || DB_PASSWORD,
  database: DB_NAME,
});

async function getConnectionRW() {
  return poolRW.getConnection();
}

module.exports = { poolRO, poolRW, getConnectionRW };