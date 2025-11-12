const asyncHandler = require('../middleware/asyncHandler');
const { pool } = require('../config/db');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Get total students
  const [totalStudentsResult] = await pool.query(
    'SELECT COUNT(*) as count FROM student'
  );
  const totalStudents = totalStudentsResult[0].count;

  // Get active students (if student table has approve column)
  let activeStudents = 0;
  try {
    const [activeStudentsResult] = await pool.query(
      'SELECT COUNT(*) as count FROM student WHERE approve = 1'
    );
    activeStudents = activeStudentsResult[0].count;
  } catch (error) {
    // If no approve column, just count all students
    activeStudents = totalStudents;
  }

  // Get pending students (if student table has approve column)
  let pendingRegistrations = 0;
  try {
    const [pendingStudentsResult] = await pool.query(
      'SELECT COUNT(*) as count FROM student WHERE approve = 0'
    );
    pendingRegistrations = pendingStudentsResult[0].count;
  } catch (error) {
    // If no approve column, pending is 0
    pendingRegistrations = 0;
  }

  // Get total users
  const [totalUsersResult] = await pool.query(
    'SELECT COUNT(*) as count FROM users'
  );
  const totalUsers = totalUsersResult[0].count;

  // Get total teachers from teachers table
  let totalTeachers = 0;
  try {
    const [totalTeachersResult] = await pool.query(
      'SELECT COUNT(*) as count FROM teachers'
    );
    totalTeachers = totalTeachersResult[0].count;
  } catch (error) {
    // If teachers table doesn't exist, count from users where role_id = 2
    try {
      const [teachersFromUsers] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE role_id = 2'
      );
      totalTeachers = teachersFromUsers[0].count;
    } catch (e) {
      console.log('Could not count teachers');
    }
  }

  // Get total departments
  let totalDepartments = 0;
  try {
    const [deptResult] = await pool.query(
      'SELECT COUNT(*) as count FROM department'
    );
    totalDepartments = deptResult[0].count;
  } catch (error) {
    // If departments table doesn't exist, count distinct departments from students
    try {
      const [deptFromStudents] = await pool.query(
        'SELECT COUNT(DISTINCT department) as count FROM student WHERE department IS NOT NULL AND department != ""'
      );
      totalDepartments = deptFromStudents[0].count;
    } catch (e) {
      console.log('Could not count departments');
    }
  }

  // Get total programs
  let totalPrograms = 0;
  try {
    const [programsResult] = await pool.query(
      'SELECT COUNT(*) as count FROM programs'
    );
    totalPrograms = programsResult[0].count;
  } catch (error) {
    // If programs table doesn't exist, count distinct programs from student
    try {
      const [programsFromStudents] = await pool.query(
        'SELECT COUNT(DISTINCT program) as count FROM student WHERE program IS NOT NULL AND program != ""'
      );
      totalPrograms = programsFromStudents[0].count;
    } catch (e) {
      console.log('Could not count programs');
    }
  }

  // Get total subjects (formerly majors)
  let totalMajors = 0;
  try {
    const [subjectsResult] = await pool.query(
      'SELECT COUNT(*) as count FROM subject'
    );
    totalMajors = subjectsResult[0].count;
  } catch (error) {
    console.log('Could not count subjects');
  }

  res.json({
    stats: {
      totalStudents,
      activeStudents,
      totalUsers,
      totalTeachers,
      pendingRegistrations,
      totalDepartments,
      totalPrograms,
      totalMajors
    }
  });
});

exports.getRecentStudents = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const [students] = await pool.query(
    `SELECT 
      s.id, 
      s.student_code as code, 
      s.std_eng_name as name,
      d.department_name as department,
      ss.status_name as status,
      DATE_FORMAT(s.created_at, '%Y-%m-%d') as date
    FROM student s
    LEFT JOIN department d ON s.department_id = d.id
    LEFT JOIN student_status ss ON s.std_status_id = ss.id
    ORDER BY s.created_at DESC
    LIMIT ?`,
    [limit]
  );

  res.json({ students });
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  // Get recent student registrations
  const [recentRegistrations] = await pool.query(
    `SELECT 
      'registration' as type,
      CONCAT('New Student Registration: ', std_eng_name) as title,
      std_eng_name as user,
      created_at
    FROM student
    ORDER BY created_at DESC
    LIMIT ?`,
    [limit]
  );

  // Format activity with relative time
  const activities = recentRegistrations.map(activity => {
    const now = new Date();
    const activityDate = new Date(activity.created_at);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo;
    if (diffMins < 60) {
      timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    return {
      type: activity.type,
      title: activity.title,
      user: activity.user,
      time: timeAgo
    };
  });

  res.json({ activities });
});

exports.getTopDepartments = asyncHandler(async (req, res) => {
  const [departments] = await pool.query(
    `SELECT 
      d.department_name as department,
      COUNT(*) as studentCount
    FROM student s
    LEFT JOIN department d ON s.department_id = d.id
    WHERE s.department_id IS NOT NULL
    GROUP BY s.department_id, d.department_name
    ORDER BY studentCount DESC
    LIMIT 5`
  );

  res.json({ departments });
});

exports.getMonthlyRegistrations = asyncHandler(async (req, res) => {
  const [registrations] = await pool.query(
    `SELECT 
      MONTH(created_at) as month,
      COUNT(*) as count
    FROM student
    WHERE YEAR(created_at) = YEAR(CURDATE())
    GROUP BY MONTH(created_at)
    ORDER BY month`
  );

  // Create array for all 12 months, fill with 0 if no data
  const monthlyData = Array(12).fill(0);
  registrations.forEach(reg => {
    monthlyData[reg.month - 1] = reg.count;
  });

  res.json({ monthlyRegistrations: monthlyData });
});
