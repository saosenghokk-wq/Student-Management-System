const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const subjectController = require('../controllers/subjectController');

router.use(protect);

router.get('/', subjectController.list);
router.post('/', subjectController.create);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.remove);

module.exports = router;
