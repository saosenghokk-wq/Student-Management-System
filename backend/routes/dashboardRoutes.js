const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all dashboard routes
router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/recent-students', dashboardController.getRecentStudents);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/top-departments', dashboardController.getTopDepartments);
router.get('/monthly-registrations', dashboardController.getMonthlyRegistrations);

module.exports = router;
