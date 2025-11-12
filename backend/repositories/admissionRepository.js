const { pool } = require('../config/db');

class AdmissionRepository {
  // Get all admissions
  async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        a.*,
        u.username as created_by_name
      FROM admission a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
    return rows;
  }

  // Get admission by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM admission WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create new admission
  async create(data) {
    const {
      admission_year,
      start_date,
      end_date,
      created_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO admission 
       (admission_year, start_date, end_date, created_by, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [admission_year, start_date, end_date, created_by]
    );
    return result.insertId;
  }

  // Update admission
  async update(id, data) {
    const {
      admission_year,
      start_date,
      end_date
    } = data;

    await pool.query(
      `UPDATE admission 
       SET admission_year = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [admission_year, start_date, end_date, id]
    );
    return true;
  }

  // Delete admission
  async delete(id) {
    await pool.query('DELETE FROM admission WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new AdmissionRepository();
