const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, parentController.list);
router.get('/my-children', authMiddleware, parentController.getMyChildren);
router.get('/child/:studentId/classes', authMiddleware, parentController.getChildClasses);
router.get('/child/:studentId/attendance-classes', authMiddleware, parentController.getChildAttendanceClasses);
router.get('/child/:studentId/class/:subjectEnrollId/attendance', authMiddleware, parentController.getChildClassAttendance);
router.get('/child/:studentId/grade-classes', authMiddleware, parentController.getChildGradeClasses);
router.get('/child/:studentId/class/:subjectEnrollId/grades', authMiddleware, parentController.getChildClassGrades);
router.post('/', authMiddleware, parentController.create);
router.put('/:id', authMiddleware, parentController.update);
router.delete('/:id', authMiddleware, parentController.remove);

module.exports = router;
