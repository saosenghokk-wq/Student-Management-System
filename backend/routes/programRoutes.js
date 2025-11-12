const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const programController = require('../controllers/programController');

router.use(protect);

router.get('/', programController.list);
router.post('/', programController.create);
router.put('/:id', programController.update);
router.delete('/:id', programController.remove);

module.exports = router;
