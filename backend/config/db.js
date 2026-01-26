const mysql = require('mysql2');
require('dotenv').config();

// Debug: Log available environment variables (Railway troubleshooting)
console.log('🔍 Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ (exists)' : '✗ (missing)');
console.log('MYSQL_URL:', process.env.MYSQL_URL ? '✓ (exists)' : '✗ (missing)');
console.log('DB_HOST:', JSON.stringify(process.env.DB_HOST));
console.log('DB_USER:', JSON.stringify(process.env.DB_USER));
console.log('DB_NAME:', JSON.stringify(process.env.DB_NAME));
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ (set)' : '✗ (not set)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

// Parse DATABASE_URL if provided (Railway format)
let dbConfig = {};
if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  console.log('📦 Using DATABASE_URL/MYSQL_URL connection string');
  const url = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);
  dbConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading /
    port: url.port || 3306
  };
} else {
  // Check if individual variables exist (even if empty)
  const hasHost = typeof process.env.DB_HOST !== 'undefined';
  const hasUser = typeof process.env.DB_USER !== 'undefined';
  const hasName = typeof process.env.DB_NAME !== 'undefined';
  
  console.log('📦 Checking individual DB environment variables:');
  console.log('  - DB_HOST exists:', hasHost);
  console.log('  - DB_USER exists:', hasUser);
  console.log('  - DB_NAME exists:', hasName);
  
  if (hasHost && hasUser && hasName) {
    console.log('📦 Using individual DB environment variables');
    dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306')
    };
  } else {
    console.error('❌ Missing required database configuration');
    console.error('Required: DATABASE_URL/MYSQL_URL OR (DB_HOST + DB_USER + DB_NAME)');
    console.error('Available DB env vars:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('MYSQL')));
    process.exit(1);
  }
}

// Promise-based pool for modern repositories/services (Railway-optimized)
const pool = mysql
  .createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 seconds for Railway
    acquireTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  })
  .promise();

// Callback-style single connection (legacy support)
const db = mysql.createConnection({
  ...dbConfig,
  connectTimeout: 60000
});

// Test connection with retry logic
const connectWithRetry = (retries = 5, delay = 5000) => {
  db.connect((err) => {
    if (err) {
      console.error('❌ Error connecting to MySQL:', err.message);
      if (retries > 0) {
        console.log(`🔄 Retrying connection... (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else {
        console.error('❌ Failed to connect after multiple retries');
        process.exit(1);
      }
    } else {
      console.log('✓ Connected to MySQL database:', dbConfig.database);
      console.log('✓ Host:', dbConfig.host);
    }
  });
};

connectWithRetry();

module.exports = { db, pool };
