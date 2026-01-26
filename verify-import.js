const mysql = require('mysql2/promise');

async function verify() {
  const connection = await mysql.createConnection({
    host: 'yamabiko.proxy.rlwy.net',
    port: 56798,
    user: 'root',
    password: 'eKwnJWobArrpDYMSuIztDRzRrRBIYCXK',
    database: 'railway'
  });

  console.log('✅ Connected to Railway MySQL\n');

  const [tables] = await connection.query('SHOW TABLES');
  console.log(`📊 Total Tables: ${tables.length}\n`);
  console.log('Tables:');
  tables.forEach(t => console.log('  ✓', Object.values(t)[0]));

  console.log('\n📈 Data Verification:');
  const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
  console.log(`  Users: ${users[0].count}`);
  
  const [students] = await connection.query('SELECT COUNT(*) as count FROM student');
  console.log(`  Students: ${students[0].count}`);
  
  const [teachers] = await connection.query('SELECT COUNT(*) as count FROM teacher');
  console.log(`  Teachers: ${teachers[0].count}`);

  const [departments] = await connection.query('SELECT COUNT(*) as count FROM department');
  console.log(`  Departments: ${departments[0].count}`);

  await connection.end();
  console.log('\n✅ Database import verified successfully!');
}

verify().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
