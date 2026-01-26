const mysql = require('mysql2');
require('dotenv').config();

// Debug: Log available environment variables
console.log('🔍 Environment Check:');
console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '✓' : '✗');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗');
console.log('MYSQL_URL:', process.env.MYSQL_URL ? '✓' : '✗');
console.log('MYSQLHOST:', process.env.MYSQLHOST || 'undefined');
console.log('MYSQLUSER:', process.env.MYSQLUSER || 'undefined');
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'undefined');
console.log('DB_HOST:', process.env.DB_HOST || 'undefined');
console.log('DB_USER:', process.env.DB_USER || 'undefined');
console.log('DB_NAME:', process.env.DB_NAME || 'undefined');

// Parse connection URL or build from Railway variables
let dbConfig = {};

// Try Railway's MYSQL_PUBLIC_URL first (format: mysql://user:pass@host:port/database)
if (process.env.MYSQL_PUBLIC_URL) {
  console.log('📦 Using MYSQL_PUBLIC_URL from Railway');
  try {
    const url = new URL(process.env.MYSQL_PUBLIC_URL);
    dbConfig = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: parseInt(url.port) || 3306
    };
  } catch (err) {
    console.error('❌ Failed to parse MYSQL_PUBLIC_URL:', err.message);
  }
}
// Try standard DATABASE_URL
else if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  console.log('📦 Using DATABASE_URL/MYSQL_URL');
  try {
    const url = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);
    dbConfig = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: parseInt(url.port) || 3306
    };
  } catch (err) {
    console.error('❌ Failed to parse DATABASE_URL:', err.message);
  }
}
// Try Railway's individual MySQL variables (MYSQLHOST, MYSQLUSER, etc.)
else if (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLDATABASE) {
  console.log('📦 Using Railway MySQL individual variables (MYSQLHOST, MYSQLUSER, MYSQLDATABASE)');
  dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE,
    port: parseInt(process.env.MYSQLPORT || '3306')
  };
}
// Try custom individual variables (DB_HOST, DB_USER, etc.)
else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  console.log('📦 Using custom DB environment variables');
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  };
}
// No valid configuration found
else {
  console.error('❌ No valid database configuration found');
  console.error('Available env vars:', Object.keys(process.env).filter(k => 
    k.includes('MYSQL') || k.includes('DB') || k.includes('DATABASE')
  ));
  process.exit(1);
}

// Log final configuration (hide password)
console.log('📊 Final DB Config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  password: dbConfig.password ? '***' : '(empty)'
});

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
