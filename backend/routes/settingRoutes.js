const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/authMiddleware');

// Get settings (public - no auth required for login page)
router.get('/', settingController.getSettings);

// Update settings (admin only - protected)
router.put('/', authMiddleware, settingController.updateSettings);

module.exports = router;
