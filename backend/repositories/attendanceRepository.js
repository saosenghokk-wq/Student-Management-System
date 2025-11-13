const pool = require('../config/db').pool;

const attendanceRepository = {
  // Get all attendance records with joins
  async findAll() {
    const query = `
      SELECT 
        a.id,
        a.student_id,
        a.subject_enroll_id,
        a.status_type,
        a.remake,
        a.attendance_date,
        a.modified_by,
        a.marked_at,
        s.std_eng_name as student_name,
        s.student_code as student_code,
        subj.subject_name,
        subj.subject_code,
        se.semester,
        b.batch_code,
        ast.typs as status_name,
        u.username as modified_by_name
      FROM attendance a
      LEFT JOIN student s ON a.student_id = s.id
      LEFT JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN users u ON a.modified_by = u.id
      ORDER BY a.attendance_date DESC, a.marked_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Get attendance by ID
  async findById(id) {
    const query = `
      SELECT 
        a.*,
        s.std_eng_name as student_name,
        s.student_code as student_code,
        subj.subject_name,
        subj.subject_code,
        se.semester,
        b.batch_code,
        ast.typs as status_name
      FROM attendance a
      LEFT JOIN student s ON a.student_id = s.id
      LEFT JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      WHERE a.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  // Create attendance record
  async create(attendanceData) {
    const query = `
      INSERT INTO attendance (
        student_id, subject_enroll_id, status_type, remake, 
        attendance_date, modified_by, marked_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.execute(query, [
      attendanceData.student_id,
      attendanceData.subject_enroll_id,
      attendanceData.status_type,
      attendanceData.remake || null,
      attendanceData.attendance_date,
      attendanceData.modified_by
    ]);
    return result.insertId;
  },

  // Update attendance record
  async update(id, attendanceData) {
    const query = `
      UPDATE attendance 
      SET status_type = ?, remake = ?, attendance_date = ?, 
          modified_by = ?, marked_at = NOW()
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      attendanceData.status_type,
      attendanceData.remake || null,
      attendanceData.attendance_date,
      attendanceData.modified_by,
      id
    ]);
    return result.affectedRows > 0;
  },

  // Delete attendance record
  async delete(id) {
    const query = 'DELETE FROM attendance WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // Get all attendance status types
  async getStatusTypes() {
    const query = 'SELECT id, typs as status_name FROM attendance_status_type ORDER BY id';
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Get all students
  async getStudents() {
    const query = `
      SELECT id, student_code as code, std_eng_name as name 
      FROM student 
      ORDER BY std_eng_name
    `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Get subject enrollments
  async getSubjectEnrollments(teacherId = null) {
    let query = `
      SELECT 
        se.id,
        se.subject_id,
        se.batch_id,
        se.semester,
        se.teacher_id,
        se.status,
        subj.subject_name,
        subj.subject_code,
        b.batch_code,
        t.eng_name as teacher_name
      FROM subject_enrollment se
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN teacher t ON se.teacher_id = t.id
      WHERE se.status = 1
    `;
    const params = [];
    
    // Filter by teacher if teacherId is provided
    if (teacherId) {
      query += ' AND se.teacher_id = ?';
      params.push(teacherId);
    }
    
    query += ' ORDER BY b.batch_code, subj.subject_name';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Get attendance by filters
  async findByFilters(filters) {
    let query = `
      SELECT 
        a.id,
        a.student_id,
        a.subject_enroll_id,
        a.status_type,
        a.remake,
        a.attendance_date,
        a.modified_by,
        a.marked_at,
        s.std_eng_name as student_name,
        s.student_code as student_code,
        subj.subject_name,
        subj.subject_code,
        se.semester,
        b.batch_code,
        ast.typs as status_name,
        u.username as modified_by_name
      FROM attendance a
      LEFT JOIN student s ON a.student_id = s.id
      LEFT JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN users u ON a.modified_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.student_id) {
      query += ' AND a.student_id = ?';
      params.push(filters.student_id);
    }
    if (filters.subject_enroll_id) {
      query += ' AND a.subject_enroll_id = ?';
      params.push(filters.subject_enroll_id);
    }
    if (filters.status_type) {
      query += ' AND a.status_type = ?';
      params.push(filters.status_type);
    }
    if (filters.date_from) {
      query += ' AND a.attendance_date >= ?';
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      query += ' AND a.attendance_date <= ?';
      params.push(filters.date_to);
    }

    query += ' ORDER BY a.attendance_date DESC, a.marked_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Get attendance by class and date
  async findByClassAndDate(subjectEnrollId, date) {
    const query = `
      SELECT 
        a.id,
        a.student_id,
        a.status_type,
        a.remake,
        a.attendance_date
      FROM attendance a
      WHERE a.subject_enroll_id = ? AND a.attendance_date = ?
    `;
    const [rows] = await pool.execute(query, [subjectEnrollId, date]);
    return rows;
  },

  // Save bulk attendance (insert or update)
  async saveBulk(records, modifiedBy) {
    let saved = 0;
    let updated = 0;

    for (const record of records) {
      if (record.attendance_id) {
        // Update existing record
        const query = `
          UPDATE attendance 
          SET status_type = ?, remake = ?, modified_by = ?, marked_at = NOW()
          WHERE id = ?
        `;
        await pool.execute(query, [
          record.status_type,
          record.remake || null,
          modifiedBy,
          record.attendance_id
        ]);
        updated++;
      } else {
        // Insert new record
        const query = `
          INSERT INTO attendance (
            student_id, subject_enroll_id, status_type, remake, 
            attendance_date, modified_by, marked_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        await pool.execute(query, [
          record.student_id,
          record.subject_enroll_id,
          record.status_type,
          record.remake || null,
          record.attendance_date,
          modifiedBy
        ]);
        saved++;
      }
    }

    return { saved, updated, total: saved + updated };
  },

  // Get attendance by student
  async findByStudent(studentId, subjectEnrollId = null) {
    let query = `
      SELECT 
        a.id,
        a.student_id,
        a.subject_enroll_id,
        a.status_type,
        a.remake,
        a.attendance_date,
        a.modified_by,
        a.marked_at,
        s.std_eng_name as student_name,
        s.student_code as student_code,
        subj.subject_name,
        subj.subject_code,
        se.semester,
        b.batch_code as batch_name,
        ast.typs as status_name,
        u.username as modified_by_name
      FROM attendance a
      LEFT JOIN student s ON a.student_id = s.id
      LEFT JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN users u ON a.modified_by = u.id
      WHERE a.student_id = ?
    `;
    
    const params = [studentId];
    
    if (subjectEnrollId) {
      query += ' AND a.subject_enroll_id = ?';
      params.push(subjectEnrollId);
    }
    
    query += ' ORDER BY a.attendance_date DESC, a.marked_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Get student's active classes with attendance statistics
  async getStudentActiveClassesWithAttendance(studentId) {
    const query = `
      SELECT 
        se.id as subject_enroll_id,
        subj.id as subject_id,
        subj.subject_code,
        subj.subject_name,
        subj.credit,
        se.semester,
        b.academic_year,
        b.batch_code,
        t.eng_name as teacher_name,
        u.email as teacher_email,
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
      INNER JOIN subject subj ON se.subject_id = subj.id
      INNER JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN teacher t ON se.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN attendance a ON a.subject_enroll_id = se.id AND a.student_id = s.id
      WHERE s.id = ? AND se.status = 1
      GROUP BY se.id, subj.id, subj.subject_code, subj.subject_name, subj.credit, 
               se.semester, b.academic_year, b.batch_code, t.eng_name, u.email
      ORDER BY se.semester, subj.subject_name
    `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  },

  // Get student's attendance records for a specific class
  async getStudentClassAttendance(studentId, subjectEnrollId) {
    const query = `
      SELECT 
        a.id,
        a.attendance_date,
        a.status_type,
        a.remake,
        a.marked_at,
        ast.typs as status_name,
        u.username as marked_by
      FROM attendance a
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN users u ON a.modified_by = u.id
      WHERE a.student_id = ? AND a.subject_enroll_id = ?
      ORDER BY a.attendance_date DESC
    `;
    const [rows] = await pool.execute(query, [studentId, subjectEnrollId]);
    return rows;
  }
};

module.exports = attendanceRepository;
