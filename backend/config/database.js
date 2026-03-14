// config/database.js
// MySQL connection pool configuration using mysql2

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for better performance and connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,       // Max simultaneous connections
  queueLimit: 0,             // Unlimited queued requests
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test the connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
