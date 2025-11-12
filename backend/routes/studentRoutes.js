const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');

// Protect all student routes (adjust as needed for public ones)
router.use(protect);

router.get('/', studentController.getAllStudents);
router.get('/by-batch/:batchId', studentController.getStudentsByBatch);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.put('/:id/upload-image', studentController.uploadStudentImage);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
