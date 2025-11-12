const { pool } = require('../config/db');

class RoleRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT id, name FROM roles ORDER BY id ASC');
    return rows;
  }

  async existsById(id) {
    const [rows] = await pool.query('SELECT id FROM roles WHERE id = ?', [id]);
    return rows.length > 0;
  }
}

module.exports = new RoleRepository();
