const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, parentController.list);
router.post('/', authMiddleware, parentController.create);
router.put('/:id', authMiddleware, parentController.update);
router.delete('/:id', authMiddleware, parentController.remove);

module.exports = router;
