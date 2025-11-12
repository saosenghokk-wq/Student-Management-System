const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class StaffRepository {
  // Get all staff with related data
  async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        s.Id,
        s.user_id,
        s.eng_name,
        s.khmer_name,
        s.phone,
        s.positions,
        s.province_no,
        s.district_no,
        s.commune_no,
        s.village_no,
        s.created_at,
        s.updated_at,
        p.position as position_name,
        u.username,
        u.email,
        u.status as user_status,
        prov.name as province_name,
        dist.name as district_name,
        comm.name as commune_name,
        vill.name as village_name
      FROM staff s
      LEFT JOIN position p ON s.positions = p.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN provinces prov ON s.province_no = prov.no
      LEFT JOIN districts dist ON s.district_no = dist.no
      LEFT JOIN communes comm ON s.commune_no = comm.no
      LEFT JOIN villages vill ON s.village_no = vill.no
      ORDER BY s.created_at DESC
    `);
    return rows;
  }

  // Get staff by ID
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT 
        s.Id,
        s.user_id,
        s.eng_name,
        s.khmer_name,
        s.phone,
        s.positions,
        s.province_no,
        s.district_no,
        s.commune_no,
        s.village_no,
        s.created_at,
        s.updated_at,
        p.position as position_name,
        u.username,
        u.email,
        u.status as user_status,
        prov.name as province_name,
        dist.name as district_name,
        comm.name as commune_name,
        vill.name as village_name
      FROM staff s
      LEFT JOIN position p ON s.positions = p.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN provinces prov ON s.province_no = prov.no
      LEFT JOIN districts dist ON s.district_no = dist.no
      LEFT JOIN communes comm ON s.commune_no = comm.no
      LEFT JOIN villages vill ON s.village_no = vill.no
      WHERE s.Id = ?
    `, [id]);
    return rows[0];
  }

  // Create new staff (with user account creation)
  async create(staffData) {
    const { username, email, password, eng_name, khmer_name, phone, positions, province_no, district_no, commune_no, village_no } = staffData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user account first (role_id 5 = Staff)
    const [userResult] = await pool.query(
      `INSERT INTO users (username, email, password, role_id, status, created_at)
       VALUES (?, ?, ?, 5, 'active', NOW())`,
      [username, email, hashedPassword]
    );
    
    const userId = userResult.insertId;
    
    // Then create staff record
    const [staffResult] = await pool.query(
      `INSERT INTO staff (user_id, eng_name, khmer_name, phone, positions, province_no, district_no, commune_no, village_no, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, eng_name, khmer_name, phone, positions, province_no, district_no, commune_no, village_no]
    );
    
    return staffResult.insertId;
  }

  // Update staff
  async update(id, staffData) {
    const { eng_name, khmer_name, phone, positions, province_no, district_no, commune_no, village_no } = staffData;
    await pool.query(
      `UPDATE staff 
       SET eng_name = ?, khmer_name = ?, phone = ?, positions = ?, 
           province_no = ?, district_no = ?, commune_no = ?, village_no = ?
       WHERE Id = ?`,
      [eng_name, khmer_name, phone, positions, province_no, district_no, commune_no, village_no, id]
    );
  }

  // Delete staff
  async delete(id) {
    await pool.query('DELETE FROM staff WHERE Id = ?', [id]);
  }

  // Get positions for dropdown
  async getPositions() {
    const [rows] = await pool.query('SELECT id, position FROM position ORDER BY position ASC');
    return rows;
  }
}

module.exports = new StaffRepository();
