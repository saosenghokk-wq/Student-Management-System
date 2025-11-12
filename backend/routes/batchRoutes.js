const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const batchController = require('../controllers/batchController');

// Get all batches
router.get('/', auth, batchController.getBatches);

// Get admissions
router.get('/admissions', auth, batchController.getAdmissions);

// Get batch by ID
router.get('/:id', auth, batchController.getBatchById);

// Create new batch
router.post('/', auth, batchController.createBatch);

// Update batch
router.put('/:id', auth, batchController.updateBatch);

// Delete batch
router.delete('/:id', auth, batchController.deleteBatch);

module.exports = router;
