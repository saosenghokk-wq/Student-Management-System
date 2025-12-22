const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get schedules for logged-in student
router.get('/my-schedules', scheduleController.getMySchedules);

// Get all schedules (with optional filters)
router.get('/', scheduleController.getSchedules);

// Upload new schedule
router.post('/', scheduleController.uploadSchedule);

// Update schedule
router.put('/:id', scheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
