const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { getProfile, updateProfile, deleteProfileImage } = require('../controllers/profileController');

// All routes are protected
router.use(protect);

// Profile routes
router.get('/', getProfile);
router.put('/', upload.single('profile_image'), updateProfile);
router.delete('/image', deleteProfileImage);

module.exports = router;
