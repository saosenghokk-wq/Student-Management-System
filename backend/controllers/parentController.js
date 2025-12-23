// Get child's grades for a specific class
exports.getChildClassGrades = async (req, res, next) => {
  try {
    const parentId = req.user?.parent_id;
    const { studentId, subjectEnrollId } = req.params;
    if (!parentId) {
      return res.status(403).json({ error: 'Not authorized as parent' });
    }
    // Verify this student belongs to this parent
    const [studentCheck] = await pool.query(
      'SELECT id FROM student WHERE id = ? AND parent_id = ?',
      [studentId, parentId]
    );
    if (studentCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }
    // Get grade records for this student and class
    const [rows] = await pool.query(`
      SELECT 
        g.id,
        g.grade_type_id,
        gt.grade_type,
        g.score,
        gt.max_score,
        g.remark,
        g.grade_at as entry_date,
        t.eng_name as graded_by_name
      FROM grade g
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      LEFT JOIN teacher t ON g.grade_by = t.id
      WHERE g.student_id = ? AND g.subject_enroll_id = ?
      ORDER BY g.grade_at DESC
    `, [studentId, subjectEnrollId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

// List all parents (includes user_id for each parent)
exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.username, u.email, u.status as user_status
      FROM parent p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
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
      `INSERT INTO users (username, email, password, role_id, status, created_at, update_by)
       VALUES (?, ?, ?, 5, '1', NOW(), 1)`,
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
    const [exists] = await pool.query('SELECT id, user_id FROM parent WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Parent not found' });
    
    const userId = exists[0].user_id;
    
    // Delete parent record first
    await pool.query('DELETE FROM parent WHERE id = ?', [id]);
    
    // Then delete the associated user account
    if (userId) {
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    }
    
    res.json({ message: 'Parent deleted' });
  } catch (err) {
    next(err);
  }
};

// Get children for logged-in parent
exports.getMyChildren = async (req, res, next) => {
  try {
    const parentId = req.user?.parent_id;
    
    if (!parentId) {
      return res.status(403).json({ error: 'Not authorized as parent' });
    }

    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.student_code,
        s.std_eng_name,
        s.std_khmer_name,
        s.gender,
        s.dob,
        s.phone,
        u.image as Image,
        b.batch_code,
        p.name as program_name,
        d.department_name
      FROM student s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN department d ON s.department_id = d.id
      WHERE s.parent_id = ?
      ORDER BY s.std_eng_name ASC
    `, [parentId]);
    
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get active classes for a specific child (student)
exports.getChildClasses = async (req, res, next) => {
  try {
    const parentId = req.user?.parent_id;
    const { studentId } = req.params;
    
    if (!parentId) {
      return res.status(403).json({ error: 'Not authorized as parent' });
    }

    // Verify this student belongs to this parent
    const [studentCheck] = await pool.query(
      'SELECT id FROM student WHERE id = ? AND parent_id = ?',
      [studentId, parentId]
    );
    
    if (studentCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }

    // Get all active subject enrollments for this student
    const [rows] = await pool.query(`
      SELECT 
        se.id as enrollment_id,
        se.subject_id,
        se.batch_id,
        se.semester,
        se.teacher_id,
        subj.subject_name,
        subj.subject_code,
        subj.credit,
        t.eng_name as teacher_name,
        t.phone as teacher_phone,
        b.batch_code
      FROM student s
      INNER JOIN subject_enrollment se ON se.batch_id = s.batch_id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN teacher t ON se.teacher_id = t.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      WHERE s.id = ? AND se.status = 1
      ORDER BY subj.subject_name ASC
    `, [studentId]);
    
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get child's attendance classes with statistics (similar to student's myAttendanceClasses)
exports.getChildAttendanceClasses = async (req, res, next) => {
  try {
    const parentId = req.user?.parent_id;
    const { studentId } = req.params;
    
    if (!parentId) {
      return res.status(403).json({ error: 'Not authorized as parent' });
    }

    // Verify this student belongs to this parent
    const [studentCheck] = await pool.query(
      'SELECT id FROM student WHERE id = ? AND parent_id = ?',
      [studentId, parentId]
    );
    
    if (studentCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }

    // Get all classes with attendance statistics for this student
    const [rows] = await pool.query(`
      SELECT 
        se.id as subject_enroll_id,
        se.subject_id,
        se.semester,
        b.academic_year,
        subj.subject_name,
        subj.subject_code,
        subj.credit,
        t.eng_name as teacher_name,
        b.batch_code,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status_type = 1 THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status_type = 2 THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status_type = 3 THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status_type = 4 THEN 1 ELSE 0 END) as excused_count,
        CASE 
          WHEN COUNT(a.id) > 0 THEN 
            ROUND((SUM(CASE WHEN a.status_type = 1 THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2)
          ELSE 0
        END as attendance_rate
      FROM student s
      INNER JOIN subject_enrollment se ON se.batch_id = s.batch_id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN teacher t ON se.teacher_id = t.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN attendance a ON a.subject_enroll_id = se.id AND a.student_id = s.id
      WHERE s.id = ? AND se.status = 1
      GROUP BY se.id, se.subject_id, se.semester, b.academic_year, 
               subj.subject_name, subj.subject_code, subj.credit, 
               t.eng_name, b.batch_code
      ORDER BY subj.subject_name ASC
    `, [studentId]);
    
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Get child's attendance records for a specific class
exports.getChildClassAttendance = async (req, res, next) => {
  try {
    const parentId = req.user?.parent_id;
    const { studentId, subjectEnrollId } = req.params;
    
    if (!parentId) {
      return res.status(403).json({ error: 'Not authorized as parent' });
    }

    // Verify this student belongs to this parent
    const [studentCheck] = await pool.query(
      'SELECT id FROM student WHERE id = ? AND parent_id = ?',
      [studentId, parentId]
    );
    if (studentCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }
    // Get attendance records for this student and class
    const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.status_type,
        a.remake,
        a.attendance_date,
        a.marked_at,
        ast.typs as status_name,
        u.username as marked_by
      FROM attendance a
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN users u ON a.modified_by = u.id
      WHERE a.student_id = ? AND a.subject_enroll_id = ?
      ORDER BY a.attendance_date DESC, a.marked_at DESC
    `, [studentId, subjectEnrollId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Get child's grade classes (active classes for grades)
exports.getChildGradeClasses = async (req, res, next) => {
  try {
    const parentId = req.user?.parent_id;
    const { studentId } = req.params;
    if (!parentId) {
      return res.status(403).json({ error: 'Not authorized as parent' });
    }
    // Verify this student belongs to this parent
    const [studentCheck] = await pool.query(
      'SELECT id FROM student WHERE id = ? AND parent_id = ?',
      [studentId, parentId]
    );
    if (studentCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }
    // Get all active classes for grades for this student
    const [rows] = await pool.query(`
      SELECT 
        se.id as subject_enroll_id,
        se.subject_id,
        se.batch_id,
        se.semester,
        b.academic_year,
        subj.subject_name,
        subj.subject_code,
        subj.credit,
        b.batch_code,
        t.eng_name as teacher_name,
        u.email as teacher_email,
        (SELECT COUNT(*) FROM grade WHERE grade.subject_enroll_id = se.id AND grade.student_id = s.id) as total_grades,
        (SELECT COUNT(*) FROM grade_type) as total_grade_types
      FROM student s
      INNER JOIN subject_enrollment se ON se.batch_id = s.batch_id
      INNER JOIN subject subj ON se.subject_id = subj.id
      INNER JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN teacher t ON se.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE s.id = ? 
        AND se.status = 1
      ORDER BY se.semester DESC, subj.subject_name
    `, [studentId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
