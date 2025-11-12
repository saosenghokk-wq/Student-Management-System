const express = require('express');
const router = express.Router();
const departmentChangeController = require('../controllers/departmentChangeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, departmentChangeController.createDepartmentChange);
router.get('/student/:studentId', authMiddleware, departmentChangeController.getDepartmentChangesByStudent);

module.exports = router;
