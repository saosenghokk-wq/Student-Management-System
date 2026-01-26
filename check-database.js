const mysql = require('mysql2/promise');

const config = {
  host: 'ballast.proxy.rlwy.net',
  user: 'root',
  password: 'YTollSCRWNGCirYRJtgLgKeYZxKOdmQW',
  database: 'railway',
  port: 53033
};

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to Railway MySQL...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Check users table
    const [users] = await connection.query('SELECT id, username, email, role_id FROM users LIMIT 5');
    console.log('📊 Users in database:', users.length);
    console.log(users);

    // Check roles
    const [roles] = await connection.query('SELECT * FROM roles');
    console.log('\n📋 Roles:', roles);

    await connection.end();
    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
