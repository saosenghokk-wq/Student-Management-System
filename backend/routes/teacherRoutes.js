const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const teacherController = require('../controllers/teacherController');

// Get all teachers
router.get('/', auth, teacherController.getTeachers);

// Get teacher types
router.get('/types', auth, teacherController.getTeacherTypes);

// Get positions
router.get('/positions', auth, teacherController.getPositions);

// Get teacher by ID
router.get('/:id', auth, teacherController.getTeacherById);

// Create new teacher
router.post('/', auth, teacherController.createTeacher);

// Update teacher
router.put('/:id', auth, teacherController.updateTeacher);

// Delete teacher
router.delete('/:id', auth, teacherController.deleteTeacher);

module.exports = router;
