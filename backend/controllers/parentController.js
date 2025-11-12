const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

// List all parents (includes user_id for each parent)
exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.username, u.email, u.status as user_status
      FROM parent p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.id ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Create parent
// This endpoint creates BOTH a user account and a parent record:
// 1. Creates user in users table with role_id=5 (parent role)
// 2. Creates parent record linked via user_id
// 3. Students can then reference this parent via parent_id in student table
exports.create = async (req, res, next) => {
  try {
    const {
      username, email, password,
      parent_code, mother_name, mother_occupation, mother_phone, mother_status,
      father_name, father_occupation, father_phone, father_status
    } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password are required' });
    }
    if (!parent_code || !mother_name || !mother_phone || !father_name || !father_phone) {
      return res.status(400).json({ error: 'parent_code, mother_name, mother_phone, father_name, father_phone are required' });
    }

    // Check for duplicate username
    const [dupUsername] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (dupUsername.length) return res.status(409).json({ error: 'Username already exists' });

    // Check for duplicate email
    const [dupEmail] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (dupEmail.length) return res.status(409).json({ error: 'Email already exists' });

    // Check for duplicate parent_code
    const [dupCode] = await pool.query('SELECT id FROM parent WHERE parent_code = ? LIMIT 1', [parent_code]);
    if (dupCode.length) return res.status(409).json({ error: 'Parent code already exists' });

    // Step 1: Create user account with role_id=5 (parent role)
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await pool.query(
      `INSERT INTO users (username, email, password, role_id, status, created_at) 
       VALUES (?, ?, ?, 5, '1', NOW())`,
      [username, email, hashedPassword]
    );

    const userId = userResult.insertId;
    
    // Verify user doesn't already have a relationship with another table
    const [existingRelations] = await pool.query(
      `SELECT 'student' as type FROM student WHERE user_id = ?
       UNION ALL
       SELECT 'parent' as type FROM parent WHERE user_id = ?
       UNION ALL
       SELECT 'staff' as type FROM staff WHERE user_id = ?
       LIMIT 1`,
      [userId, userId, userId]
    );
    if (existingRelations.length > 0) {
      // Rollback: delete the user we just created
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      return res.status(409).json({ error: `This user already exists as a ${existingRelations[0].type}` });
    }

    // Step 2: Create parent record linked to the user via user_id
    // This user_id allows the parent to login and links to student records via parent_id
    const [result] = await pool.query(
      `INSERT INTO parent (
        user_id, parent_code, mother_name, mother_occupation, mother_phone, mother_status,
        father_name, father_occupation, father_phone, father_status,
        province_no, district_no, commune_no, village_no, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId, parent_code, mother_name, mother_occupation || null, mother_phone, mother_status || 'alive',
        father_name, father_occupation || null, father_phone, father_status || 'alive',
        req.body.province_no || 1, req.body.district_no || 1, req.body.commune_no || 1, req.body.village_no || 1
      ]
    );

    // Return the created parent record (includes user_id for reference)
    const [created] = await pool.query('SELECT * FROM parent WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
};

// Update parent
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      parent_code, mother_name, mother_occupation, mother_phone, mother_status,
      father_name, father_occupation, father_phone, father_status
    } = req.body;

    const [exists] = await pool.query('SELECT id FROM parent WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Parent not found' });

    // Check for duplicate parent_code
    const [dupCode] = await pool.query('SELECT id FROM parent WHERE parent_code = ? AND id <> ? LIMIT 1', [parent_code, id]);
    if (dupCode.length) return res.status(409).json({ error: 'Another parent already uses this code' });

    await pool.query(
      `UPDATE parent SET 
        parent_code=?, mother_name=?, mother_occupation=?, mother_phone=?, mother_status=?,
        father_name=?, father_occupation=?, father_phone=?, father_status=?
       WHERE id=?`,
      [
        parent_code, mother_name, mother_occupation, mother_phone, mother_status,
        father_name, father_occupation, father_phone, father_status, id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM parent WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// Delete parent
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id FROM parent WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Parent not found' });
    
    await pool.query('DELETE FROM parent WHERE id = ?', [id]);
    res.json({ message: 'Parent deleted' });
  } catch (err) {
    next(err);
  }
};
