const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// IMPORTANT: More specific routes must come BEFORE generic routes like /:id

// Get grade types (must be before /:id)
router.get('/types', gradeController.getGradeTypes);

// Student routes (must be before /:id)
router.get('/my-classes', gradeController.getMyClasses);
router.get('/my-class/:subjectEnrollId', gradeController.getMyClassGrades);

// Get grades by class (must be before /:id)
router.get('/class/:subjectEnrollId', gradeController.getGradesByClass);

// Get grades by student (must be before /:id)
router.get('/student/:studentId', gradeController.getGradesByStudent);

// Save bulk grades (must be before /:id)
router.post('/bulk', gradeController.saveBulkGrades);

// Get all grades
router.get('/', gradeController.getAllGrades);

// Get grade by ID (generic route - must be after specific routes)
router.get('/:id', gradeController.getGradeById);

// Create grade record
router.post('/', gradeController.createGrade);

// Update grade record
router.put('/:id', gradeController.updateGrade);

// Delete grade record
router.delete('/:id', gradeController.deleteGrade);

module.exports = router;
