const mysql = require('mysql2');

// Callback-style single connection (legacy support)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sms'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Promise-based pool for modern repositories/services
const pool = mysql
  .createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  .promise();

module.exports = { db, pool };
