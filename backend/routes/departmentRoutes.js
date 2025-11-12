const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const departmentController = require('../controllers/departmentController');

router.use(protect);

router.get('/', departmentController.list);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.remove);

module.exports = router;
