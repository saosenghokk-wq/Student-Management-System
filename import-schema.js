const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  const connection = await mysql.createConnection({
    host: 'yamanote.proxy.rlwy.net',
    port: 54070,
    user: 'root',
    password: 'zioImWGKlaTNOlVftBQelbPbOehumPlX',
    database: 'railway',
    multipleStatements: true,
    connectTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  console.log('Connected to Railway MySQL...');

  const schemaPath = path.join(__dirname, 'backend', 'sql', 'schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Remove MySQL-specific commands that might cause issues
  schema = schema.replace(/\/\*!.*?\*\/;?/gs, '');
  schema = schema.replace(/USE `sms`;?/gi, '');
  schema = schema.replace(/CREATE DATABASE.*?;/gi, '');

  console.log('Importing schema...');
  await connection.query(schema);

  console.log('✅ Schema imported successfully!');
  await connection.end();
}

importSchema().catch(err => {
  console.error('❌ Error importing schema:', err.message);
  process.exit(1);
});
