const pool = require('../config/db').pool;

const gradeRepository = {
  // Get all grades with joins
  async findAll() {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_enroll_id,
        g.grade_type_id,
        g.score,
        g.remark,
        g.grade_by,
        g.grade_at,
        s.std_eng_name as student_name,
        s.student_code,
        subj.subject_name,
        subj.subject_code,
        se.semester,
        b.batch_code as batch_name,
        gt.grade_type,
        gt.max_score,
        t.teacher_name as graded_by_name
      FROM grade g
      LEFT JOIN student s ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      LEFT JOIN teacher t ON g.grade_by = t.id
      ORDER BY g.grade_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Get grade by ID
  async findById(id) {
    const query = `
      SELECT 
        g.*,
        s.std_eng_name as student_name,
        s.student_code,
        subj.subject_name,
        subj.subject_code,
        gt.grade_type,
        gt.max_score
      FROM grade g
      LEFT JOIN student s ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      WHERE g.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  // Create grade record
  async create(gradeData) {
    const query = `
      INSERT INTO grade (
        student_id, subject_enroll_id, grade_type_id, score, 
        remark, grade_by, grade_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.execute(query, [
      gradeData.student_id,
      gradeData.subject_enroll_id,
      gradeData.grade_type_id,
      gradeData.score,
      gradeData.remark || null,
      gradeData.grade_by
    ]);
    return result.insertId;
  },

  // Update grade record
  async update(id, gradeData) {
    const query = `
      UPDATE grade 
      SET score = ?, remark = ?, grade_by = ?, grade_at = NOW()
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      gradeData.score,
      gradeData.remark || null,
      gradeData.grade_by,
      id
    ]);
    return result.affectedRows > 0;
  },

  // Delete grade record
  async delete(id) {
    const query = 'DELETE FROM grade WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // Get all grade types
  async getGradeTypes() {
    const query = 'SELECT id, grade_type, max_score FROM grade_type ORDER BY id';
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Get grades by class (subject enrollment)
  async findByClass(subjectEnrollId, gradeTypeId = null) {
    let query = `
      SELECT 
        g.id,
        g.student_id,
        g.grade_type_id,
        g.score,
        g.remark,
        s.std_eng_name as student_name,
        s.student_code,
        gt.grade_type,
        gt.max_score
      FROM grade g
      LEFT JOIN student s ON g.student_id = s.id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      WHERE g.subject_enroll_id = ?
    `;
    
    const params = [subjectEnrollId];
    
    if (gradeTypeId) {
      query += ' AND g.grade_type_id = ?';
      params.push(gradeTypeId);
    }
    
    query += ' ORDER BY s.std_eng_name';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Get grades by student
  async findByStudent(studentId, subjectEnrollId = null) {
    let query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_enroll_id,
        g.grade_type_id,
        g.score,
        g.remark,
        g.grade_by,
        g.grade_at,
        s.std_eng_name as student_name,
        s.student_code,
        subj.subject_name,
        subj.subject_code,
        se.semester,
        b.batch_code as batch_name,
        gt.grade_type,
        gt.max_score,
        t.teacher_name as graded_by_name
      FROM grade g
      LEFT JOIN student s ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      LEFT JOIN teacher t ON g.grade_by = t.id
      WHERE g.student_id = ?
    `;
    
    const params = [studentId];
    
    if (subjectEnrollId) {
      query += ' AND g.subject_enroll_id = ?';
      params.push(subjectEnrollId);
    }
    
    query += ' ORDER BY g.grade_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Save bulk grades (insert or update)
  async saveBulk(records, gradedBy) {
    let saved = 0;
    let updated = 0;

    for (const record of records) {
      if (record.grade_id) {
        // Update existing record
        const query = `
          UPDATE grade 
          SET score = ?, remark = ?, grade_by = ?, grade_at = NOW()
          WHERE id = ?
        `;
        await pool.execute(query, [
          record.score,
          record.remark || null,
          gradedBy,
          record.grade_id
        ]);
        updated++;
      } else {
        // Insert new record
        const query = `
          INSERT INTO grade (
            student_id, subject_enroll_id, grade_type_id, score, 
            remark, grade_by, grade_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        await pool.execute(query, [
          record.student_id,
          record.subject_enroll_id,
          record.grade_type_id,
          record.score,
          record.remark || null,
          gradedBy
        ]);
        saved++;
      }
    }

    return { saved, updated, total: saved + updated };
  },

  // Get active classes for a student
  async getStudentActiveClasses(studentId) {
    const query = `
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
        (SELECT COUNT(*) FROM grade WHERE grade.subject_enroll_id = se.id AND grade.student_id = ?) as total_grades,
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
    `;
    const [rows] = await pool.execute(query, [studentId, studentId]);
    return rows;
  },

  // Get student grades for a specific class with statistics
  async getStudentClassGrades(studentId, subjectEnrollId) {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_enroll_id,
        g.grade_type_id,
        g.score,
        g.remark,
        g.grade_by,
        g.grade_at as entry_date,
        s.std_eng_name as student_name,
        s.student_code,
        subj.subject_name,
        subj.subject_code,
        subj.credit,
        se.semester,
        b.academic_year,
        b.batch_code as batch_name,
        gt.grade_type,
        gt.max_score,
        t.eng_name as graded_by_name
      FROM grade g
      LEFT JOIN student s ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      LEFT JOIN teacher t ON g.grade_by = t.id
      WHERE g.student_id = ? AND g.subject_enroll_id = ?
      ORDER BY g.grade_at DESC
    `;
    const [rows] = await pool.execute(query, [studentId, subjectEnrollId]);
    return rows;
  },

  // Get subject enrollments for grades (filtered by teacher if applicable)
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
  }
};

module.exports = gradeRepository;
