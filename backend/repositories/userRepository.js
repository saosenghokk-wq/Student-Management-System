const { pool } = require('../config/db');

class UserRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findByUsernameOrEmail(identifier) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [identifier, identifier]);
    return rows[0] || null;
  }

  async emailExists(email) {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    return rows.length > 0;
  }

  async create(user) {
    const [result] = await pool.query('INSERT INTO users SET ?', user);
    return { id: result.insertId, ...user };
  }

  async update(id, user) {
    await pool.query('UPDATE users SET ? WHERE id = ?', [user, id]);
    return { id, ...user };
  }

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new UserRepository();
