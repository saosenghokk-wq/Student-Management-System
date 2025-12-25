const mysql = require('mysql2/promise');
const fs = require('fs');

async function importDatabase() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: 'mysql.railway.internal',
    port: 3306,
    user: 'root',
    password: 'sbByyURteIvgZltKFUqIIgYIhEsT',
    database: 'railway',
    connectTimeout: 60000,
    multipleStatements: false
  });

  console.log('✅ Connected to MySQL');

  const sql = fs.readFileSync('sms.sql', 'utf8');
  
  // Split into statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`Executing ${statements.length} statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    try {
      await connection.query(statements[i]);
      if ((i + 1) % 100 === 0) {
        console.log(`Progress: ${i + 1}/${statements.length}`);
      }
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.warn(`Statement ${i}: ${err.message.substring(0, 80)}`);
      }
    }
  }

  console.log('✅ Import completed!');
  await connection.end();
}

importDatabase().catch(console.error);
