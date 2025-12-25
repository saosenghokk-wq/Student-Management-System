const mysql = require('mysql2/promise');
const fs = require('fs');

async function importToRailway() {
  console.log('Connecting to Railway MySQL...');
  const connection = await mysql.createConnection({
    host: 'yamabiko.proxy.rlwy.net',
    port: 56798,
    user: 'root',
    password: 'eKwnJWobArrpDYMSuIztDRzRrRBIYCXK',
    database: 'railway',
    multipleStatements: true,
    connectTimeout: 60000
  });

  console.log('✅ Connected!');
  console.log('Reading SQL file...');
  
  const sql = fs.readFileSync('railway-phpMyAdmin.sql', 'utf8');
  
  console.log('Importing database... (this may take a few minutes)');
  await connection.query(sql);
  
  console.log('✅ Database imported successfully!');
  await connection.end();
}

importToRailway().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
