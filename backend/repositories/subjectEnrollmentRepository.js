const { pool } = require('../config/db');

class SubjectEnrollmentRepository {
  // Get all subject enrollments with related data
  async findAll(departmentId = null) {
    let query = `
      SELECT 
        se.id,
        se.program_id,
        se.subject_id,
        se.teacher_id,
        se.batch_id,
        se.semester,
        se.status,
        se.start_date,
        se.end_date,
        se.created_by,
        se.created_at,
        se.updated_at,
        p.name as program_name,
        p.code as program_code,
        p.department_id,
        s.subject_name,
        s.subject_code,
        s.credit,
        t.eng_name as teacher_name,
        b.batch_code,
        b.academic_year,
        ses.status_type as status_name,
        d.department_name
      FROM subject_enrollment se
      LEFT JOIN programs p ON se.program_id = p.id
      LEFT JOIN subject s ON se.subject_id = s.id
      LEFT JOIN teacher t ON se.teacher_id = t.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN subject_enroll_status ses ON se.status = ses.id
      LEFT JOIN department d ON p.department_id = d.id
    `;
    
    const params = [];
    if (departmentId) {
      query += ' WHERE p.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY se.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get subject enrollment by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM subject_enrollment WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create new subject enrollment
  async create(data) {
    const {
      program_id,
      subject_id,
      teacher_id,
      batch_id,
      semester,
      status,
      start_date,
      end_date,
      created_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO subject_enrollment 
       (program_id, subject_id, teacher_id, batch_id, semester, status, 
        start_date, end_date, created_by, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [program_id, subject_id, teacher_id, batch_id, semester, status, 
       start_date, end_date, created_by]
    );
    return result.insertId;
  }

  // Update subject enrollment
  async update(id, data) {
    const {
      program_id,
      subject_id,
      teacher_id,
      batch_id,
      semester,
      status,
      start_date,
      end_date
    } = data;

    await pool.query(
      `UPDATE subject_enrollment 
       SET program_id = ?, subject_id = ?, teacher_id = ?, batch_id = ?, 
           semester = ?, status = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [program_id, subject_id, teacher_id, batch_id, semester, status, 
       start_date, end_date, id]
    );
    return true;
  }

  // Delete subject enrollment
  async delete(id) {
    await pool.query('DELETE FROM subject_enrollment WHERE id = ?', [id]);
    return true;
  }

  // Get enrollment statuses
  async getStatuses() {
    const [rows] = await pool.query('SELECT id, status_type as status_name FROM subject_enroll_status ORDER BY id');
    return rows;
  }
}

module.exports = new SubjectEnrollmentRepository();
