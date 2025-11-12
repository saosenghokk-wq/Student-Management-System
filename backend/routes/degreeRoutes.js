const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const degreeController = require('../controllers/degreeController');

router.use(protect);

router.get('/', degreeController.list);

module.exports = router;
