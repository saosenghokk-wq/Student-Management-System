const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const staffController = require('../controllers/staffController');

router.use(protect);

// Get all staff
router.get('/', staffController.getStaff);

// Get positions for dropdown
router.get('/positions', staffController.getPositions);

// Get staff by ID
router.get('/:id', staffController.getStaffById);

// Create new staff
router.post('/', staffController.createStaff);

// Update staff
router.put('/:id', staffController.updateStaff);

// Delete staff
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
