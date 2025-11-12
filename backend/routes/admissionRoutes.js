const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all admissions
router.get('/', authMiddleware, admissionController.getAdmissions);

// Get admission by ID
router.get('/:id', authMiddleware, admissionController.getAdmissionById);

// Create new admission
router.post('/', authMiddleware, admissionController.createAdmission);

// Update admission
router.put('/:id', authMiddleware, admissionController.updateAdmission);

// Delete admission
router.delete('/:id', authMiddleware, admissionController.deleteAdmission);

module.exports = router;
