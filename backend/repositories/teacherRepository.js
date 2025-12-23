const { pool } = require('../config/db');

class TeacherRepository {
  // Get all teachers with related data
  async findAll(departmentId = null) {
    let query = `
      SELECT 
        t.id,
        t.user_id,
        t.eng_name,
        t.khmer_name,
        t.phone,
        t.teacher_types_id,
        t.position,
        t.department_id,
        t.province_no,
        t.district_no,
        t.commune_no,
        t.village_no,
        t.created_at,
        t.updated_at,
        d.department_name,
        tt.types as teacher_type_name,
        p.position as position_name,
        u.username,
        u.email,
        u.status as user_status
      FROM teacher t
      LEFT JOIN department d ON t.department_id = d.id
      LEFT JOIN teacher_types tt ON t.teacher_types_id = tt.id
      LEFT JOIN position p ON t.position = p.id
      LEFT JOIN users u ON t.user_id = u.id
    `;
    
    const params = [];
    if (departmentId) {
      query += ' WHERE t.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get teacher by ID
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM teacher WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create new teacher
  async create(data) {
    const {
      user_id,
      eng_name,
      khmer_name,
      phone,
      teacher_types_id,
      position,
      department_id,
      province_no,
      district_no,
      commune_no,
      village_no
    } = data;

    const [result] = await pool.query(
      `INSERT INTO teacher 
       (user_id, eng_name, khmer_name, phone, teacher_types_id, position, 
        department_id, province_no, district_no, commune_no, village_no, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, eng_name, khmer_name, phone, teacher_types_id, position, 
       department_id, province_no, district_no, commune_no, village_no]
    );
    return result.insertId;
  }

  // Update teacher
  async update(id, data) {
    const {
      eng_name,
      khmer_name,
      phone,
      teacher_types_id,
      position,
      department_id,
      province_no,
      district_no,
      commune_no,
      village_no
    } = data;

    await pool.query(
      `UPDATE teacher 
       SET eng_name = ?, khmer_name = ?, phone = ?, teacher_types_id = ?, 
           position = ?, department_id = ?, province_no = ?, district_no = ?, 
           commune_no = ?, village_no = ?
       WHERE id = ?`,
      [eng_name, khmer_name, phone, teacher_types_id, position, department_id, 
       province_no, district_no, commune_no, village_no, id]
    );
    return true;
  }

  // Delete teacher
  async delete(id) {
    // First, get the user_id associated with this teacher
    const [teacherRows] = await pool.query('SELECT user_id FROM teacher WHERE id = ?', [id]);
    
    if (teacherRows.length > 0 && teacherRows[0].user_id) {
      const userId = teacherRows[0].user_id;
      
      // Delete teacher record first
      await pool.query('DELETE FROM teacher WHERE id = ?', [id]);
      
      // Then delete the associated user account
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    } else {
      // If no user_id found, just delete the teacher record
      await pool.query('DELETE FROM teacher WHERE id = ?', [id]);
    }
    
    return true;
  }

  // Get teacher types
  async getTeacherTypes() {
    const [rows] = await pool.query('SELECT * FROM teacher_types ORDER BY id');
    return rows;
  }

  // Get positions
  async getPositions() {
    const [rows] = await pool.query('SELECT * FROM position ORDER BY id');
    return rows;
  }
}

module.exports = new TeacherRepository();
