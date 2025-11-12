const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', roleController.getRoles);

module.exports = router;
