const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class StaffRepository {
  // Get all staff with related data
  async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        s.Id as id,
        s.user_id,
        s.eng_name,
        s.khmer_name,
        s.phone,
        s.province_no,
        s.district_no,
        s.commune_no,
        s.village_no,
        s.created_at,
        s.updated_at,
        u.username,
        u.email,
        u.status as user_status,
        u.department_id,
        d.department_name,
        prov.name as province_name,
        dist.name as district_name,
        comm.name as commune_name,
        vill.name as village_name
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN department d ON u.department_id = d.id
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
        s.province_no,
        s.district_no,
        s.commune_no,
        s.village_no,
        s.created_at,
        s.updated_at,
        u.username,
        u.email,
        u.status as user_status,
        u.department_id,
        d.department_name,
        prov.name as province_name,
        dist.name as district_name,
        comm.name as commune_name,
        vill.name as village_name
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN department d ON u.department_id = d.id
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
    const { username, email, password, eng_name, khmer_name, phone, province_no, district_no, commune_no, village_no, department_id } = staffData;
    
    const connection = await pool.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user account first (role_id 2 = Dean, status 1 = active)
      const [userResult] = await connection.query(
        `INSERT INTO users (username, email, password, role_id, status, department_id, created_at)
         VALUES (?, ?, ?, 2, 1, ?, NOW())`,
        [username, email, hashedPassword, department_id || null]
      );
      
      const userId = userResult.insertId;
      
      // Then create staff record
      const [staffResult] = await connection.query(
        `INSERT INTO staff (user_id, eng_name, khmer_name, phone, province_no, district_no, commune_no, village_no, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userId, eng_name, khmer_name, phone, province_no, district_no, commune_no, village_no]
      );
      
      // Commit transaction
      await connection.commit();
      
      return staffResult.insertId;
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection back to pool
      connection.release();
    }
  }

  // Update staff
  async update(id, staffData) {
    const { eng_name, khmer_name, phone, province_no, district_no, commune_no, village_no, username, email, password } = staffData;
    
    // Update staff table
    await pool.query(
      `UPDATE staff 
       SET eng_name = ?, khmer_name = ?, phone = ?, 
           province_no = ?, district_no = ?, commune_no = ?, village_no = ?
       WHERE Id = ?`,
      [eng_name, khmer_name, phone, province_no, district_no, commune_no, village_no, id]
    );
    
    // If username, email, or password provided, update users table
    if (username || email || password) {
      // Get the user_id for this staff member
      const [staffRows] = await pool.query('SELECT user_id FROM staff WHERE Id = ?', [id]);
      if (staffRows.length > 0 && staffRows[0].user_id) {
        const userId = staffRows[0].user_id;
        const updates = [];
        const values = [];
        
        if (username) {
          updates.push('username = ?');
          values.push(username);
        }
        if (email) {
          updates.push('email = ?');
          values.push(email);
        }
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          updates.push('password = ?');
          values.push(hashedPassword);
        }
        
        if (updates.length > 0) {
          values.push(userId);
          await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
          );
        }
      }
    }
  }

  // Delete staff
  async delete(id) {
    await pool.query('DELETE FROM staff WHERE Id = ?', [id]);
  }
}

module.exports = new StaffRepository();
