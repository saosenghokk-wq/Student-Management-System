const { pool } = require('../config/db');

// ==================== STUDENT REPORTS ====================

// Student Profile Report - Detailed student information
exports.getStudentProfileReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id } = req.query;
    
    let query = `
      SELECT 
        s.id,
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 1 OR s.gender = '1' OR LOWER(s.gender) = 'male' THEN 'Male'
          WHEN s.gender = 0 OR s.gender = '0' OR LOWER(s.gender) = 'female' THEN 'Female'
          ELSE COALESCE(s.gender, 'N/A')
        END as gender,
        DATE_FORMAT(s.dob, '%d/%m/%Y') as dob,
        COALESCE(s.phone, 'N/A') as phone,
        COALESCE(pr.name, 'N/A') as province,
        COALESCE(di.name, 'N/A') as district,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(p.name, 'N/A') as program,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(b.academic_year, 'N/A') as academic_year,
        COALESCE(st.scholarship, 'None') as scholarship_type,
        COALESCE(ss.std_status, 'N/A') as status
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN provinces pr ON s.province_no = pr.no
      LEFT JOIN districts di ON s.district_no = di.no
      LEFT JOIN scholarship_type st ON s.schoolarship_id = st.id
      LEFT JOIN student_status ss ON s.std_status_id = ss.Id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    
    query += ' ORDER BY s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Student List Report - Simple list by various filters
exports.getStudentListReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, status } = req.query;
    
    let query = `
      SELECT DISTINCT
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 1 OR s.gender = '1' OR LOWER(s.gender) = 'male' THEN 'Male'
          WHEN s.gender = 0 OR s.gender = '0' OR LOWER(s.gender) = 'female' THEN 'Female'
          ELSE COALESCE(s.gender, 'N/A')
        END as gender,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(b.academic_year, 'N/A') as academic_year
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN student_status ss ON s.std_status_id = ss.Id
    `;
    
    // If filtering by subject, join with subject_enrollment
    if (subject_id) {
      query += `
        JOIN subject_enrollment se ON se.batch_id = b.Id
        JOIN subject sub ON se.subject_id = sub.id
      `;
    }
    
    query += ' WHERE 1=1';
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (subject_id) {
      query += ' AND sub.id = ?';
      params.push(subject_id);
    }
    if (status) {
      query += ' AND ss.std_status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY b.batch_code, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Student Enrollment Report - Students enrollment statistics
exports.getStudentEnrollmentReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.academic_year,
        COUNT(s.id) as total_students,
        COUNT(CASE WHEN s.gender = 'Male' THEN 1 END) as male_count,
        COUNT(CASE WHEN s.gender = 'Female' THEN 1 END) as female_count,
        COUNT(CASE WHEN ss.std_status = 'Active' THEN 1 END) as active_students,
        COUNT(CASE WHEN st.id IS NOT NULL THEN 1 END) as scholarship_students
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN scholarship_type st ON s.schoolarship_id = st.id
      LEFT JOIN student_status ss ON s.std_status_id = ss.Id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Student Enrollment Report Error:', err.message);
    console.error('Query params:', req.query);
    next(err);
  }
};

// Student Promotion Report - Track student progression
exports.getStudentPromotionReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_eng_name as name,
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.academic_year,
        COUNT(DISTINCT se.semester) as completed_semesters,
        ROUND(AVG(g.score), 2) as average_score,
        COUNT(DISTINCT se.subject_id) as subjects_taken,
        CASE 
          WHEN COUNT(DISTINCT se.semester) >= 8 THEN 'Ready for Graduation'
          WHEN COUNT(DISTINCT se.semester) >= 4 THEN 'Mid-Program'
          ELSE 'Early Stage'
        END as promotion_status
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN subject_enrollment se ON b.Id = se.batch_id
      LEFT JOIN grade g ON se.id = g.subject_enroll_id AND g.student_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Student Promotion Report Error:', err.message);
    console.error('Query params:', req.query);
    next(err);
  }
};

// Student Performance Report - Detailed performance by semester with GPA
exports.getStudentPerformanceReport = async (req, res, next) => {
  try {
    const { student_id } = req.query;
    
    if (!student_id) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    // Get student info
    const studentQuery = `
      SELECT 
        s.student_code,
        s.std_khmer_name,
        s.std_eng_name,
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.academic_year
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE s.id = ?
    `;
    
    const [studentInfo] = await pool.query(studentQuery, [student_id]);
    
    if (studentInfo.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get grades by semester
    const gradesQuery = `
      SELECT 
        se.semester,
        subj.subject_name,
        subj.credit,
        AVG(g.score) as average_score
      FROM grade g
      INNER JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      INNER JOIN subject subj ON se.subject_id = subj.id
      WHERE g.student_id = ?
      GROUP BY se.semester, subj.id, subj.subject_name, subj.credit
      ORDER BY se.semester, subj.subject_name
    `;
    
    const [grades] = await pool.query(gradesQuery, [student_id]);
    
    // Group by semester and calculate semester averages
    const semesterData = {};
    let totalCredits = 0;
    let weightedGradeSum = 0;
    
    grades.forEach(row => {
      const semester = row.semester || 'N/A';
      const credit = parseFloat(row.credit) || 3;
      const score = parseFloat(row.average_score) || 0;
      
      if (!semesterData[semester]) {
        semesterData[semester] = {
          semester: semester,
          subjects: [],
          total_score: 0,
          total_credits: 0,
          semester_average: 0
        };
      }
      
      semesterData[semester].subjects.push({
        subject_name: row.subject_name,
        credit: credit,
        score: Math.round(score * 100) / 100
      });
      
      semesterData[semester].total_score += score * credit;
      semesterData[semester].total_credits += credit;
      
      totalCredits += credit;
      weightedGradeSum += score * credit;
    });
    
    // Calculate semester averages
    const semesters = Object.values(semesterData).map(sem => {
      sem.semester_average = sem.total_credits > 0 
        ? Math.round((sem.total_score / sem.total_credits) * 100) / 100 
        : 0;
      return sem;
    });
    
    // Calculate overall average and GPA
    const overall_average = totalCredits > 0 
      ? Math.round((weightedGradeSum / totalCredits) * 100) / 100 
      : 0;
    
    // GPA calculation (4.0 scale)
    const calculateGPA = (avg) => {
      if (avg >= 90) return 4.0;
      if (avg >= 80) return 3.0 + ((avg - 80) / 10) * 1.0;
      if (avg >= 70) return 2.0 + ((avg - 70) / 10) * 1.0;
      if (avg >= 60) return 1.0 + ((avg - 60) / 10) * 1.0;
      return 0;
    };
    
    const gpa = Math.round(calculateGPA(overall_average) * 100) / 100;
    
    const result = {
      student: studentInfo[0],
      semesters: semesters,
      overall_average: overall_average,
      gpa: gpa,
      total_credits: totalCredits
    };
    
    res.json([result]);
  } catch (err) {
    console.error('Student Performance Report Error:', err.message);
    next(err);
  }
};

// Student Status Report - Filter by student status
exports.getStudentStatusReport = async (req, res, next) => {
  try {
    const { status} = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 1 OR s.gender = '1' OR LOWER(s.gender) = 'male' THEN 'Male'
          WHEN s.gender = 0 OR s.gender = '0' OR LOWER(s.gender) = 'female' THEN 'Female'
          ELSE COALESCE(s.gender, 'N/A')
        END as gender,
        DATE_FORMAT(s.dob, '%d/%m/%Y') as dob,
        COALESCE(s.phone, 'N/A') as phone,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(b.academic_year, 'N/A') as academic_year,
        COALESCE(ss.std_status, 'N/A') as status
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN student_status ss ON s.std_status_id = ss.Id
      WHERE 1=1
    `;
    
    const params = [];
    if (status) {
      query += ' AND ss.std_status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ss.std_status, d.department_name, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Student Status Report Error:', err.message);
    console.error('Query params:', req.query);
    next(err);
  }
};

// ==================== ACADEMIC REPORTS ====================

// Grade Report - Student grades by subject and semester (with pivoted grade types)
exports.getGradeReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, semester } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 'M' OR s.gender = '1' OR s.gender = 1 THEN 'Male'
          WHEN s.gender = 'F' OR s.gender = '0' OR s.gender = 0 THEN 'Female'
          ELSE s.gender
        END as gender,
        COALESCE(subj.subject_name, 'N/A') as subject,
        COALESCE(se.semester, 'N/A') as semester,
        COALESCE(gt.grade_type, 'N/A') as grade_type,
        COALESCE(g.score, 0) as score,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(b.academic_year, 'N/A') as academic_year
      FROM grade g
      INNER JOIN student s ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (subject_id) {
      query += ' AND subj.id = ?';
      params.push(subject_id);
    }
    if (semester) {
      query += ' AND se.semester = ?';
      params.push(semester);
    }
    
    query += ' ORDER BY d.department_name, b.batch_code, subj.subject_name, se.semester, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    
    // Transform data: pivot grade types into columns
    const pivotedData = {};
    
    rows.forEach(row => {
      const key = `${row.student_code}-${row.subject}-${row.semester}`;
      
      if (!pivotedData[key]) {
        pivotedData[key] = {
          student_code: row.student_code,
          khmer_name: row.khmer_name,
          english_name: row.english_name,
          gender: row.gender,
          subject: row.subject,
          semester: row.semester,
          department: row.department,
          batch_code: row.batch_code,
          academic_year: row.academic_year
        };
      }
      
      // Add score for this grade type
      pivotedData[key][row.grade_type] = row.score;
    });
    
    const result = Object.values(pivotedData);
    res.json(result);
  } catch (err) {
    console.error('Grade Report Error:', err.message);
    next(err);
  }
};

// Score Execution Report - Student performance by subject (pivoted)
exports.getScoreExecutionReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, semester } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        COALESCE(subj.subject_name, 'N/A') as subject,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(b.academic_year, 'N/A') as academic_year,
        ROUND(SUM(g.score), 2) as total_score
      FROM student s
      INNER JOIN grade g ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (semester) {
      query += ' AND se.semester = ?';
      params.push(semester);
    }
    
    query += `
      GROUP BY s.id, subj.id, s.student_code, s.std_khmer_name, s.std_eng_name, 
               subj.subject_name, d.department_name, b.batch_code, b.academic_year
      ORDER BY d.department_name, b.batch_code, s.std_eng_name, subj.subject_name
    `;
    
    const [rows] = await pool.query(query, params);
    
    // Pivot data: convert subjects into columns
    const pivotedData = {};
    
    rows.forEach(row => {
      const key = row.student_code;
      
      if (!pivotedData[key]) {
        pivotedData[key] = {
          student_code: row.student_code,
          khmer_name: row.khmer_name,
          english_name: row.english_name,
          department: row.department,
          batch_code: row.batch_code,
          academic_year: row.academic_year,
          subject_scores: []
        };
      }
      
      // Add subject score as a column (ensure it's a number)
      const scoreValue = parseFloat(row.total_score) || 0;
      pivotedData[key][row.subject] = scoreValue;
      pivotedData[key].subject_scores.push(scoreValue);
    });
    
    // Calculate average from all subject scores
    const result = Object.values(pivotedData).map(student => {
      const scores = student.subject_scores.filter(s => s > 0); // Only count non-zero scores
      const totalScores = scores.reduce((sum, score) => sum + score, 0);
      const count = scores.length;
      student.average_score = count > 0 
        ? Math.round((totalScores / count) * 100) / 100
        : null; // Return null instead of 0 to make it clear there's no data
      delete student.subject_scores;
      delete student.student_code; // Remove student code from output
      return student;
    });
    
    // Sort by average_score descending (highest first)
    result.sort((a, b) => (b.average_score || 0) - (a.average_score || 0));
    
    res.json(result);
  } catch (err) {
    console.error('Score Execution Report Error:', err.message);
    next(err);
  }
};

// Attendance Report - Student attendance tracking
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 1 OR s.gender = '1' OR LOWER(s.gender) = 'male' THEN 'Male'
          WHEN s.gender = 0 OR s.gender = '0' OR LOWER(s.gender) = 'female' THEN 'Female'
          ELSE COALESCE(s.gender, 'N/A')
        END as gender,
        COALESCE(subj.subject_name, 'N/A') as subject,
        COALESCE(se.semester, 'N/A') as semester,
        DATE_FORMAT(a.attendance_date, '%d/%m/%Y') as attendance_date,
        COALESCE(ast.typs, 'N/A') as attendance_status,
        COALESCE(a.remake, '-') as remarks,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code
      FROM attendance a
      INNER JOIN student s ON a.student_id = s.id
      LEFT JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (subject_id) {
      query += ' AND subj.id = ?';
      params.push(subject_id);
    }
    if (start_date) {
      query += ' AND a.attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND a.attendance_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY d.department_name, b.batch_code, a.attendance_date DESC, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Attendance Report Error:', err.message);
    next(err);
  }
};

// Attendance Summary Report - Count attendance types and calculate rates
exports.getAttendanceSummaryReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 1 OR s.gender = '1' OR LOWER(s.gender) = 'male' THEN 'Male'
          WHEN s.gender = 0 OR s.gender = '0' OR LOWER(s.gender) = 'female' THEN 'Female'
          ELSE COALESCE(s.gender, 'N/A')
        END as gender,
        COALESCE(subj.subject_name, 'N/A') as subject,
        COALESCE(se.semester, 'N/A') as semester,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COUNT(*) as total_sessions,
        SUM(CASE WHEN LOWER(ast.typs) = 'present' OR LOWER(ast.typs) = 'p' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN LOWER(ast.typs) = 'absent' OR LOWER(ast.typs) = 'a' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN LOWER(ast.typs) = 'late' OR LOWER(ast.typs) = 'l' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN LOWER(ast.typs) = 'permission' OR LOWER(ast.typs) = 'per' THEN 1 ELSE 0 END) as permission_count,
        ROUND((SUM(CASE WHEN LOWER(ast.typs) = 'present' OR LOWER(ast.typs) = 'p' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM attendance a
      INNER JOIN student s ON a.student_id = s.id
      LEFT JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (subject_id) {
      query += ' AND subj.id = ?';
      params.push(subject_id);
    }
    if (start_date) {
      query += ' AND a.attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND a.attendance_date <= ?';
      params.push(end_date);
    }
    
    query += ' GROUP BY s.id, subj.id, se.semester, d.id, b.Id';
    query += ' ORDER BY d.department_name, b.batch_code, subj.subject_name, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Attendance Summary Report Error:', err.message);
    next(err);
  }
};


// Class Performance Report - Academic performance statistics
exports.getClassPerformanceReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, academic_year } = req.query;
    
    let query = `
      SELECT 
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(b.academic_year, 'N/A') as academic_year,
        COALESCE(subj.subject_name, 'N/A') as subject,
        COALESCE(gt.grade_type, 'N/A') as grade_type,
        COUNT(DISTINCT g.student_id) as total_students,
        ROUND(AVG(CAST(g.score AS DECIMAL(5,2))), 2) as average_score,
        MAX(CAST(g.score AS DECIMAL(5,2))) as highest_score,
        MIN(CAST(g.score AS DECIMAL(5,2))) as lowest_score
      FROM grade g
      INNER JOIN student s ON g.student_id = s.id
      LEFT JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (subject_id) {
      query += ' AND subj.id = ?';
      params.push(subject_id);
    }
    if (academic_year) {
      query += ' AND b.academic_year = ?';
      params.push(academic_year);
    }
    
    query += ' GROUP BY d.department_name, b.batch_code, b.academic_year, subj.subject_name, gt.grade_type';
    query += ' ORDER BY d.department_name, b.batch_code, subj.subject_name, gt.grade_type';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Class Performance Report Error:', err.message);
    next(err);
  }
};

// Subject Enrollment Summary - Student enrollment in subjects
exports.getSubjectEnrollmentReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        COUNT(DISTINCT se.subject_id) as enrolled_subjects_count,
        GROUP_CONCAT(DISTINCT subj.subject_name ORDER BY subj.subject_name SEPARATOR ', ') as subjects,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN subject_enrollment se ON b.Id = se.batch_id
      LEFT JOIN subject subj ON se.subject_id = subj.id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (subject_id) {
      query += ' AND subj.id = ?';
      params.push(subject_id);
    }
    
    query += ' GROUP BY s.id, s.student_code, s.std_khmer_name, s.std_eng_name, d.department_name, b.batch_code';
    query += ' ORDER BY d.department_name, b.batch_code, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Subject Enrollment Report Error:', err.message);
    next(err);
  }
};

// Fee Report - Student fee payment tracking
exports.getFeeReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, start_date, end_date, payment_status } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_khmer_name as khmer_name,
        s.std_eng_name as english_name,
        CASE 
          WHEN s.gender = 1 OR s.gender = '1' OR LOWER(s.gender) = 'male' THEN 'Male'
          WHEN s.gender = 0 OR s.gender = '0' OR LOWER(s.gender) = 'female' THEN 'Female'
          ELSE COALESCE(s.gender, 'N/A')
        END as gender,
        COALESCE(d.department_name, 'N/A') as department,
        COALESCE(b.batch_code, 'N/A') as batch_code,
        COALESCE(p.name, 'N/A') as program,
        COUNT(fp.id) as total_payments,
        COALESCE(SUM(fp.amount), 0) as total_paid,
        DATE_FORMAT(MIN(fp.pay_date), '%d/%m/%Y') as first_payment,
        DATE_FORMAT(MAX(fp.pay_date), '%d/%m/%Y') as last_payment,
        CASE 
          WHEN COUNT(fp.id) = 0 THEN 'No Payment'
          WHEN SUM(fp.amount) < 500 THEN 'Partial'
          ELSE 'Paid'
        END as payment_status
      FROM student s
      LEFT JOIN fee_payment fp ON s.id = fp.student_id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (program_id) {
      query += ' AND p.id = ?';
      params.push(program_id);
    }
    if (batch_id) {
      query += ' AND b.Id = ?';
      params.push(batch_id);
    }
    if (start_date) {
      query += ' AND fp.pay_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND fp.pay_date <= ?';
      params.push(end_date);
    }
    
    query += ' GROUP BY s.id, d.id, b.Id, p.id';
    
    if (payment_status) {
      query += ' HAVING payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY d.department_name, b.batch_code, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Fee Report Error:', err.message);
    next(err);
  }
};

// Get filter options for reports
exports.getReportFilters = async (req, res, next) => {
  try {
    const [departments] = await pool.query('SELECT id, department_name FROM department ORDER BY department_name');
    const [programs] = await pool.query('SELECT id, name, department_id FROM programs ORDER BY name');
    const [batches] = await pool.query('SELECT Id as id, batch_code, program_id FROM batch ORDER BY academic_year DESC');
    const [subjects] = await pool.query('SELECT id, subject_name, program_id FROM subject ORDER BY subject_name');
    const [academicYears] = await pool.query('SELECT DISTINCT academic_year FROM batch ORDER BY academic_year DESC');
    
    res.json({
      departments,
      programs,
      batches,
      subjects,
      academicYears: academicYears.map(y => y.academic_year)
    });
  } catch (err) {
    next(err);
  }
};
