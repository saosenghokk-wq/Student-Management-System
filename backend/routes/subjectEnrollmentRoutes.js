const express = require('express');
const router = express.Router();
const subjectEnrollmentController = require('../controllers/subjectEnrollmentController');
const auth = require('../middleware/authMiddleware');

// Get all subject enrollments
router.get('/', auth, subjectEnrollmentController.getSubjectEnrollments);

// Get enrollment statuses
router.get('/statuses', auth, subjectEnrollmentController.getStatuses);

// Get subject enrollment by ID
router.get('/:id', auth, subjectEnrollmentController.getSubjectEnrollmentById);

// Create new subject enrollment
router.post('/', auth, subjectEnrollmentController.createSubjectEnrollment);

// Update subject enrollment
router.put('/:id', auth, subjectEnrollmentController.updateSubjectEnrollment);

// Delete subject enrollment
router.delete('/:id', auth, subjectEnrollmentController.deleteSubjectEnrollment);

module.exports = router;
