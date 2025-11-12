const { pool } = require('../config/db');

class TeacherRepository {
  // Get all teachers with related data
  async findAll() {
    const [rows] = await pool.query(`
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
      ORDER BY t.created_at DESC
    `);
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
    await pool.query('DELETE FROM teacher WHERE id = ?', [id]);
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
