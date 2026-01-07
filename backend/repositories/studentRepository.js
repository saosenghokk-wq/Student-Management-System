const { pool } = require('../config/db');

class StudentRepository {
  async findAll(departmentId = null) {
    let query = `
      SELECT 
        s.*,
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.Id as batch_id,
        u.image as profile_image
      FROM student s
      LEFT JOIN department d ON s.department_id = d.id
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN users u ON s.user_id = u.id
    `;
    const params = [];
    
    if (departmentId) {
      query += ' WHERE s.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getAllWithDetails(search = '') {
    let query = `
      SELECT 
        s.id,
        s.student_code,
        s.std_eng_name,
        s.std_khmer_name,
        s.gender,
        s.phone,
        s.batch_id,
        s.department_id,
        s.schoolarship_id,
        b.batch_code as batch_name,
        d.department_name,
        p.name as program_name,
        st.scholarship as scholarship_name
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN department d ON s.department_id = d.id
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN scholarship_type st ON s.schoolarship_id = st.id
    `;
    
    const params = [];
    if (search) {
      query += ` WHERE 
        s.std_eng_name LIKE ? OR 
        s.std_khmer_name LIKE ? OR 
        s.student_code LIKE ? OR
        b.batch_code LIKE ? OR
        d.department_name LIKE ?
      `;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY s.created_at DESC`;
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM student WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(student) {
    const [result] = await pool.query('INSERT INTO student SET ?', student);
    return { id: result.insertId, ...student };
  }

  async update(id, student) {
    await pool.query('UPDATE student SET ? WHERE id = ?', [student, id]);
    return { id, ...student };
  }

  async delete(id) {
    // First, get the user_id associated with this student
    const [studentRows] = await pool.query('SELECT user_id FROM student WHERE id = ?', [id]);
    
    if (studentRows.length > 0 && studentRows[0].user_id) {
      const userId = studentRows[0].user_id;
      
      // Delete student record first
      await pool.query('DELETE FROM student WHERE id = ?', [id]);
      
      // Then delete the associated user account
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    } else {
      // If no user_id found, just delete the student record
      await pool.query('DELETE FROM student WHERE id = ?', [id]);
    }
    
    return true;
  }
}

module.exports = new StudentRepository();
