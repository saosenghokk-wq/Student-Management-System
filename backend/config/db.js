const mysql = require('mysql2');
require('dotenv').config();

// Validate required environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Missing required database configuration (DB_HOST, DB_USER, DB_NAME)');
  console.error('Please create a .env file based on .env.example');
  process.exit(1);
}

// Callback-style single connection (legacy support)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to MySQL database:', process.env.DB_NAME);
});

// Promise-based pool for modern repositories/services
const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  .promise();

module.exports = { db, pool };
