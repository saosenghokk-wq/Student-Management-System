const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// Get settings (accessible to all authenticated users)
router.get('/', settingController.getSettings);

// Update settings (admin only - we'll check in frontend)
router.put('/', settingController.updateSettings);

module.exports = router;
