const { pool } = require('../config/db');

// ==================== ACADEMIC REPORTS ====================

// Student Performance Report
exports.getStudentPerformanceReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, student_id, semester } = req.query;
    
    let query = `
      SELECT 
        s.student_code,
        s.std_eng_name as eng_name,
        s.std_khmer_name as khmer_name,
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.academic_year,
        se.semester,
        sub.subject_name,
        sub.subject_code,
        gt.grade_type,
        g.score,
        gt.max_score
      FROM grade g
      JOIN student s ON g.student_id = s.id
      JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      JOIN subject sub ON se.subject_id = sub.id
      JOIN programs p ON se.program_id = p.id
      JOIN department d ON p.department_id = d.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
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
      query += ' AND sub.id = ?';
      params.push(subject_id);
    }
    if (student_id) {
      query += ' AND s.id = ?';
      params.push(student_id);
    }
    if (semester) {
      query += ' AND se.semester = ?';
      params.push(semester);
    }
    
    query += ' ORDER BY s.std_eng_name, se.semester, sub.subject_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Grade Distribution Report
exports.getGradeDistributionReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.academic_year,
        sub.subject_name,
        gt.grade_type,
        FLOOR(g.score / 10) * 10 as score_range,
        COUNT(*) as count
      FROM grade g
      JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      JOIN subject sub ON se.subject_id = sub.id
      JOIN programs p ON se.program_id = p.id
      JOIN department d ON p.department_id = d.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
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
      query += ' AND sub.id = ?';
      params.push(subject_id);
    }
    
    query += ' GROUP BY d.department_name, p.name, b.batch_code, b.academic_year, sub.subject_name, gt.grade_type, score_range ORDER BY score_range';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ==================== ATTENDANCE REPORTS ====================

// Student Attendance Report
exports.getStudentAttendanceReport = async (req, res, next) => {
  try {
    const { student_id, subject_id, program_id, batch_id, department_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        s.student_code,
        s.std_eng_name as eng_name,
        s.std_khmer_name as khmer_name,
        sub.subject_name,
        a.attendance_date as date,
        ast.typs as status,
        a.remake as remarks
      FROM attendance a
      JOIN student s ON a.student_id = s.id
      JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      JOIN subject sub ON se.subject_id = sub.id
      JOIN programs p ON se.program_id = p.id
      JOIN department d ON p.department_id = d.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
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
    if (student_id) {
      query += ' AND s.id = ?';
      params.push(student_id);
    }
    if (subject_id) {
      query += ' AND sub.id = ?';
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
    
    query += ' ORDER BY a.attendance_date DESC, s.std_eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Attendance Summary Report
exports.getAttendanceSummaryReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        s.student_code,
        s.std_eng_name as eng_name,
        s.std_khmer_name as khmer_name,
        COUNT(CASE WHEN ast.typs = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN ast.typs = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ast.typs = 'late' THEN 1 END) as late_count,
        COUNT(*) as total_classes,
        ROUND((COUNT(CASE WHEN ast.typs = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_rate
      FROM attendance a
      JOIN student s ON a.student_id = s.id
      JOIN subject_enrollment se ON a.subject_enroll_id = se.id
      JOIN programs p ON se.program_id = p.id
      JOIN department d ON p.department_id = d.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN attendance_status_type ast ON a.status_type = ast.id
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
      query += ' AND a.attendance_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND a.attendance_date <= ?';
      params.push(end_date);
    }
    
    query += ' GROUP BY s.id ORDER BY attendance_rate ASC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ==================== MANAGEMENT REPORTS ====================

// Student Enrollment Report
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
        COUNT(CASE WHEN s.gender = 'Female' THEN 1 END) as female_count
      FROM student s
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
    
    query += ' GROUP BY d.department_name, p.name, b.batch_code, b.academic_year';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Teacher Workload Report
exports.getTeacherWorkloadReport = async (req, res, next) => {
  try {
    const { department_id, teacher_id } = req.query;
    
    let query = `
      SELECT 
        t.eng_name as teacher_name,
        d.department_name,
        COUNT(DISTINCT se.id) as total_subjects,
        COUNT(DISTINCT se.program_id) as programs_count,
        GROUP_CONCAT(DISTINCT sub.subject_name SEPARATOR ', ') as subjects_taught,
        se.semester,
        b.academic_year
      FROM subject_enrollment se
      JOIN teacher t ON se.teacher_id = t.id
      LEFT JOIN department dt ON t.department_id = dt.id
      JOIN subject sub ON se.subject_id = sub.id
      JOIN programs p ON se.program_id = p.id
      JOIN department d ON p.department_id = d.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      WHERE 1=1
    `;
    
    const params = [];
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    if (teacher_id) {
      query += ' AND t.id = ?';
      params.push(teacher_id);
    }
    
    query += ' GROUP BY t.id, se.semester, b.academic_year ORDER BY t.eng_name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Department Statistics Report
exports.getDepartmentStatisticsReport = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        d.department_name,
        COUNT(DISTINCT p.id) as total_programs,
        COUNT(DISTINCT t.id) as total_teachers,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT sub.id) as total_subjects,
        st.eng_name as head_staff
      FROM department d
      LEFT JOIN programs p ON d.id = p.department_id
      LEFT JOIN teacher t ON d.id = t.department_id
      LEFT JOIN batch b ON p.id = b.program_id
      LEFT JOIN student s ON b.Id = s.batch_id
      LEFT JOIN subject sub ON p.id = sub.program_id
      LEFT JOIN staff st ON d.staff_id = st.Id
      GROUP BY d.id
      ORDER BY d.department_name
    `;
    
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Admission Report
exports.getAdmissionReport = async (req, res, next) => {
  try {
    const { department_id, admission_year, program_id, batch_id } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        a.admission_year,
        a.start_date,
        a.end_date,
        COUNT(s.id) as total_admitted
      FROM admission a
      LEFT JOIN batch b ON a.id = b.admission_id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN student s ON b.Id = s.batch_id
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
    if (admission_year) {
      query += ' AND a.admission_year = ?';
      params.push(admission_year);
    }
    
    query += ' GROUP BY a.id, p.id ORDER BY a.admission_year DESC, p.name';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ==================== FINANCIAL REPORTS ====================

// Fee Collection Report
exports.getFeeCollectionReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        s.student_code,
        s.std_eng_name as eng_name,
        s.std_khmer_name as khmer_name,
        f.amount,
        f.pay_date as payment_date,
        f.payment_method,
        f.description,
        st.eng_name as processed_by
      FROM fee_payment f
      JOIN student s ON f.student_id = s.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN staff st ON f.make_by = st.Id
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
      query += ' AND f.pay_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND f.pay_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY f.pay_date DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Outstanding Fees Report
exports.getOutstandingFeesReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        s.student_code,
        s.std_eng_name as eng_name,
        s.std_khmer_name as khmer_name,
        COALESCE(SUM(f.amount), 0) as total_paid,
        COUNT(f.id) as payment_count,
        COALESCE(MAX(f.pay_date), 'No payments') as last_payment_date
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN fee_payment f ON s.id = f.student_id
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
    
    query += ' GROUP BY s.id ORDER BY total_paid ASC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ==================== ANALYTICS REPORTS ====================

// Student Demographics Report
exports.getStudentDemographicsReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id } = req.query;
    
    let whereClause = '';
    const params = [];
    
    if (department_id || program_id || batch_id) {
      const conditions = [];
      if (department_id) {
        conditions.push('d.id = ?');
        params.push(department_id);
      }
      if (program_id) {
        conditions.push('p.id = ?');
        params.push(program_id);
      }
      if (batch_id) {
        conditions.push('b.Id = ?');
        params.push(batch_id);
      }
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }
    
    const query = `
      SELECT 
        'Gender Distribution' as category,
        s.gender as subcategory,
        COUNT(*) as count
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      ${whereClause}
      GROUP BY s.gender
      
      UNION ALL
      
      SELECT 
        'By Province' as category,
        pr.name as subcategory,
        COUNT(*) as count
      FROM student s
      LEFT JOIN provinces pr ON s.province_no = pr.no
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      ${whereClause}
      GROUP BY pr.name
      
      UNION ALL
      
      SELECT 
        'By Program' as category,
        p.name as subcategory,
        COUNT(*) as count
      FROM student s
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN programs p ON b.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      ${whereClause}
      GROUP BY p.name
      
      ORDER BY category, count DESC
    `;
    
    const allParams = [...params, ...params, ...params];
    const [rows] = await pool.query(query, allParams);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Pass/Fail Rate Report
exports.getPassFailRateReport = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, subject_id, academic_year } = req.query;
    
    let query = `
      SELECT 
        d.department_name,
        p.name as program_name,
        b.batch_code,
        sub.subject_name,
        b.academic_year,
        gt.grade_type,
        COUNT(*) as total_students,
        COUNT(CASE WHEN g.score >= 50 THEN 1 END) as passed,
        COUNT(CASE WHEN g.score < 50 THEN 1 END) as failed,
        ROUND((COUNT(CASE WHEN g.score >= 50 THEN 1 END) * 100.0 / COUNT(*)), 2) as pass_rate,
        ROUND(AVG(g.score), 2) as average_score
      FROM grade g
      JOIN subject_enrollment se ON g.subject_enroll_id = se.id
      JOIN subject sub ON se.subject_id = sub.id
      JOIN programs p ON se.program_id = p.id
      JOIN department d ON p.department_id = d.id
      LEFT JOIN batch b ON se.batch_id = b.Id
      LEFT JOIN grade_type gt ON g.grade_type_id = gt.id
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
      query += ' AND sub.id = ?';
      params.push(subject_id);
    }
    if (academic_year) {
      query += ' AND b.academic_year = ?';
      params.push(academic_year);
    }
    
    query += ' GROUP BY d.department_name, p.name, b.batch_code, sub.subject_name, b.academic_year, gt.grade_type ORDER BY pass_rate ASC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
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
