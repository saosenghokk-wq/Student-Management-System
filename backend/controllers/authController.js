const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login: expects { username (or email), password, rememberMe }
exports.login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }
    
    // Support login with username OR email
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const [results] = await pool.query(query, [username, username]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];

    // Check if user account is active
    if (user.status === '0') {
      return res.status(403).json({ 
        error: 'Account is inactive. Please contact admin or student center for activation.' 
      });
    }

    // Compare password (supports both plain and hashed)
    const passwordMatches = user.password === password || (await bcrypt.compare(password, user.password));
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Include role_id for role-based access control
    const payload = { 
      id: user.id, 
      role_id: user.role_id, 
      username: user.username,
      email: user.email 
    };
    
    // If user is a student (role_id = 4), include student_id
    if (user.role_id === 4) {
      const [studentResults] = await pool.query('SELECT id FROM student WHERE user_id = ?', [user.id]);
      if (studentResults.length > 0) {
        payload.student_id = studentResults[0].id;
      }
    }
    
    // If user is a teacher (role_id = 3), include teacher_id and department_id
    if (user.role_id === 3) {
      const [teacherResults] = await pool.query('SELECT id, department_id FROM teacher WHERE user_id = ?', [user.id]);
      if (teacherResults.length > 0) {
        payload.teacher_id = teacherResults[0].id;
        payload.department_id = teacherResults[0].department_id;
      }
    }
    
    // If user is a parent (role_id = 5), include parent_id
    if (user.role_id === 5) {
      const [parentResults] = await pool.query('SELECT id FROM parent WHERE user_id = ?', [user.id]);
      if (parentResults.length > 0) {
        payload.parent_id = parentResults[0].id;
      }
    }
    
    // If user is a dean (role_id = 2), include department_id
    if (user.role_id === 2 && user.department_id) {
      payload.department_id = user.department_id;
    }
    
    // Set token expiration based on rememberMe
    // If rememberMe: 7 days, else: 15 minutes
    const expiresIn = rememberMe ? '7d' : '15m';
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn });
    
    res.json({ token, user: payload, expiresIn: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// (Optional) Protect route test
exports.me = (req, res) => {
  res.json({ user: req.user });
};

// Student Registration/Enrollment
exports.register = async (req, res) => {
  const { username, email, password, std_eng_name, std_khmer_name, gender, dob, phone } = req.body;

  // Validation
  if (!username || !email || !password || !std_eng_name || !dob) {
    return res.status(400).json({ error: 'Required fields: username, email, password, std_eng_name, dob' });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get Student role_id (should be 4 based on seed data)
    const [roleResults] = await pool.query('SELECT id FROM roles WHERE name = ?', ['Student']);
    const studentRoleId = roleResults.length > 0 ? roleResults[0].id : 4;

    // Create user with status=inactive ('0')
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role_id: studentRoleId,
      status: '0', // Inactive by default
      created_at: new Date(),
      update_by: 0
    };

    const [userResult] = await pool.query('INSERT INTO users SET ?', newUser);
    const userId = userResult.insertId;

    try {
      // Create basic student record
      const newStudent = {
        user_id: userId,
        student_code: `TEMP${userId}`, // Temporary code, update later
        std_eng_name: std_eng_name,
        std_khmer_name: std_khmer_name || std_eng_name,
        gender: gender || '0',
        dob: dob,
        phone: phone || 0,
        from_high_school: '',
        nationality: 'Cambodia',
        race: 'Khmer',
        marital_status: '0',
        description: 'Pending enrollment',
        parent_id: 1, // Default parent, update later
        province_no: 1,
        district_no: 1,
        commune_no: 1,
        village_no: 1,
        std_status_id: 1,
        department_id: 1,
        program_id: 1,
        batch_id: 1,
        created_at: new Date()
      };

      await pool.query('INSERT INTO student SET ?', newStudent);

      res.json({
        success: true,
        message: 'Registration successful! Your account is pending activation. Admin or student center will contact you soon.',
        user: {
          id: userId,
          username,
          email,
          status: 'inactive'
        }
      });
    } catch (studentError) {
      // Rollback user if student creation fails
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      throw studentError;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
