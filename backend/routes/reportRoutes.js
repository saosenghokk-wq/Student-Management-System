const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// All report routes require authentication
router.use(authMiddleware);

// Academic Reports
router.get('/student-performance', reportController.getStudentPerformanceReport);
router.get('/grade-distribution', reportController.getGradeDistributionReport);

// Attendance Reports
router.get('/student-attendance', reportController.getStudentAttendanceReport);
router.get('/attendance-summary', reportController.getAttendanceSummaryReport);

// Management Reports
router.get('/student-enrollment', reportController.getStudentEnrollmentReport);
router.get('/teacher-workload', reportController.getTeacherWorkloadReport);
router.get('/department-statistics', reportController.getDepartmentStatisticsReport);
router.get('/admission', reportController.getAdmissionReport);

// Financial Reports
router.get('/fee-collection', reportController.getFeeCollectionReport);
router.get('/outstanding-fees', reportController.getOutstandingFeesReport);

// Analytics Reports
router.get('/student-demographics', reportController.getStudentDemographicsReport);
router.get('/pass-fail-rate', reportController.getPassFailRateReport);

// Filter options
router.get('/filters', reportController.getReportFilters);

module.exports = router;
