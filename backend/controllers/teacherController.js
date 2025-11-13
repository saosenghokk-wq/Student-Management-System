const teacherService = require('../services/teacherService');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Get all teachers
exports.getTeachers = async (req, res, next) => {
  try {
    // If user is a dean (role_id = 2), filter by their department_id
    const departmentId = req.user?.role_id === 2 ? req.user.department_id : null;
    const teachers = await teacherService.getAllTeachers(departmentId);
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

// Get teacher by ID
exports.getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await teacherService.getTeacherById(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

// Create new teacher (with user account)
exports.createTeacher = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      eng_name,
      khmer_name,
      phone,
      teacher_types_id,
      position,
      department_id,
      province_no,
      district_no,
      commune_no,
      village_no
    } = req.body;

    // Check if username or email already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account with role_id = 3 (Teacher)
    const [userResult] = await pool.query(
      'INSERT INTO users (username, email, password, role_id, status, created_at) VALUES (?, ?, ?, 3, "1", NOW())',
      [username, email, hashedPassword]
    );

    const user_id = userResult.insertId;

    // Create teacher record
    const teacherId = await teacherService.createTeacher({
      user_id,
      eng_name,
      khmer_name,
      phone,
      teacher_types_id,
      position,
      department_id,
      province_no,
      district_no,
      commune_no,
      village_no
    });

    res.status(201).json({ 
      message: 'Teacher created successfully', 
      id: teacherId,
      user_id 
    });
  } catch (err) {
    next(err);
  }
};

// Update teacher
exports.updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    await teacherService.updateTeacher(id, req.body);
    res.json({ message: 'Teacher updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    await teacherService.deleteTeacher(id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get teacher types
exports.getTeacherTypes = async (req, res, next) => {
  try {
    const types = await teacherService.getTeacherTypes();
    res.json(types);
  } catch (err) {
    next(err);
  }
};

// Get positions
exports.getPositions = async (req, res, next) => {
  try {
    const positions = await teacherService.getPositions();
    res.json(positions);
  } catch (err) {
    next(err);
  }
};
