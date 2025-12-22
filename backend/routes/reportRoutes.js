const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// All report routes require authentication
router.use(authMiddleware);

// Filter options
router.get('/filters', reportController.getReportFilters);

// Student Reports
router.get('/student-profile', reportController.getStudentProfileReport);
router.get('/student-list', reportController.getStudentListReport);
router.get('/student-enrollment', reportController.getStudentEnrollmentReport);
router.get('/student-promotion', reportController.getStudentPromotionReport);
router.get('/student-status', reportController.getStudentStatusReport);

// Academic Reports
router.get('/grade-report', reportController.getGradeReport);
router.get('/attendance-report', reportController.getAttendanceReport);
router.get('/attendance-summary', reportController.getAttendanceSummaryReport);

// Financial Reports
router.get('/fee-report', reportController.getFeeReport);

module.exports = router;
