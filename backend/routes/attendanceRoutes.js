const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// Get all attendance records
router.get('/', attendanceController.getAttendance);

// Get filter options
router.get('/status-types', attendanceController.getStatusTypes);
router.get('/students', attendanceController.getStudents);
router.get('/subject-enrollments', attendanceController.getSubjectEnrollments);

// Filter attendance
router.get('/filter', attendanceController.getAttendanceByFilters);

// Get attendance by class and date
router.get('/class/:subjectEnrollId/date/:date', attendanceController.getAttendanceByClassAndDate);

// Get attendance by student
router.get('/student/:studentId', attendanceController.getAttendanceByStudent);

// Student role - Get my classes with attendance statistics
router.get('/my-classes', attendanceController.getMyAttendanceClasses);

// Student role - Get my attendance for a specific class
router.get('/my-class/:subjectEnrollId', attendanceController.getMyClassAttendance);

// Save bulk attendance
router.post('/bulk', attendanceController.saveBulkAttendance);

// Get attendance by ID
router.get('/:id', attendanceController.getAttendanceById);

// Create attendance record
router.post('/', attendanceController.createAttendance);

// Update attendance record
router.put('/:id', attendanceController.updateAttendance);

// Delete attendance record
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
