const { pool } = require('../config/db');

class BatchRepository {
  // Get all batches with related data
  async findAll(departmentId = null) {
    let query = `
      SELECT 
        b.Id,
        b.batch_code,
        b.batch_code as batch_name,
        b.program_id,
        b.academic_year,
        b.admission_id,
        b.create_by,
        b.created_at,
        b.updated_at,
        p.name as program_name,
        p.code as program_code,
        p.department_id,
        d.department_name,
        a.admission_year,
        a.start_date as admission_start_date,
        a.end_date as admission_end_date
      FROM batch b
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN admission a ON b.admission_id = a.id
    `;
    
    const params = [];
    if (departmentId) {
      query += ' WHERE p.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get batch by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM batch WHERE Id = ?',
      [id]
    );
    return rows[0];
  }

  // Create new batch
  async create(data) {
    const {
      batch_code,
      program_id,
      academic_year,
      admission_id,
      create_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO batch 
       (batch_code, program_id, academic_year, admission_id, create_by, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [batch_code, program_id, academic_year, admission_id, create_by]
    );
    return result.insertId;
  }

  // Update batch
  async update(id, data) {
    const {
      batch_code,
      program_id,
      academic_year,
      admission_id,
      updated_by
    } = data;

    await pool.query(
      `UPDATE batch 
       SET batch_code = ?, program_id = ?, academic_year = ?, 
           admission_id = ?, updated_by = ?
       WHERE Id = ?`,
      [batch_code, program_id, academic_year, admission_id, updated_by, id]
    );
    return true;
  }

  // Delete batch
  async delete(id) {
    await pool.query('DELETE FROM batch WHERE Id = ?', [id]);
    return true;
  }

  // Get all admissions
  async getAdmissions() {
    const [rows] = await pool.query('SELECT * FROM admission ORDER BY admission_year DESC');
    return rows;
  }
}

module.exports = new BatchRepository();
