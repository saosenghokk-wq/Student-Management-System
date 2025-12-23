const mysql = require('mysql2');
require('dotenv').config();

// Parse DATABASE_URL if provided (Railway format)
let dbConfig = {};
if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  const url = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);
  dbConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading /
    port: url.port || 3306
  };
} else {
  // Validate required environment variables
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error('❌ Missing required database configuration (DB_HOST, DB_USER, DB_NAME)');
    console.error('Please create a .env file based on .env.example');
    process.exit(1);
  }
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
  };
}

// Callback-style single connection (legacy support)
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to MySQL database:', dbConfig.database);
});

// Promise-based pool for modern repositories/services
const pool = mysql
  .createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  .promise();

module.exports = { db, pool };
