const { pool } = require('../config/db');

const scheduleRepository = {
  async getAll() {
    const query = `
      SELECT 
        s.*,
        b.batch_code,
        b.academic_year
      FROM image_schedule s
      JOIN batch b ON s.batch_id = b.Id
      ORDER BY s.upload_date DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  async getByBatch(batchId) {
    const query = `
      SELECT 
        s.*,
        b.batch_code,
        b.academic_year
      FROM image_schedule s
      JOIN batch b ON s.batch_id = b.Id
      WHERE s.batch_id = ?
      ORDER BY s.semester, s.upload_date DESC
    `;
    const [rows] = await pool.query(query, [batchId]);
    return rows;
  },

  async getByBatchAndSemester(batchId, semester) {
    const query = `
      SELECT 
        s.*,
        b.batch_code,
        b.academic_year
      FROM image_schedule s
      JOIN batch b ON s.batch_id = b.Id
      WHERE s.batch_id = ? AND s.semester = ?
      ORDER BY s.upload_date DESC
    `;
    const [rows] = await pool.query(query, [batchId, semester]);
    return rows;
  },

  async create(scheduleData) {
    const { batch_id, image, semester, create_by } = scheduleData;
    const query = `
      INSERT INTO image_schedule (batch_id, image, semester, create_by)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [batch_id, image, semester, create_by]);
    return result.insertId;
  },

  async update(id, scheduleData) {
    const { batch_id, image, semester } = scheduleData;
    const query = `
      UPDATE image_schedule 
      SET batch_id = ?, image = ?, semester = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [batch_id, image, semester, id]);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const query = 'DELETE FROM image_schedule WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  },

  async getById(id) {
    const query = 'SELECT * FROM image_schedule WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  },

  async getByStudentId(studentId) {
    const query = `
      SELECT 
        s.*,
        b.batch_code,
        b.academic_year
      FROM image_schedule s
      JOIN batch b ON s.batch_id = b.Id
      JOIN student st ON st.batch_id = b.Id
      WHERE st.id = ?
      ORDER BY s.semester, s.upload_date DESC
    `;
    const [rows] = await pool.query(query, [studentId]);
    return rows;
  }
};

module.exports = scheduleRepository;
