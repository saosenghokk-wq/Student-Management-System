const batchService = require('../services/batchService');

// Get all batches
exports.getBatches = async (req, res, next) => {
  try {
    const batches = await batchService.getAllBatches();
    res.json(batches);
  } catch (err) {
    next(err);
  }
};

// Get batch by ID
exports.getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await batchService.getBatchById(id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
  } catch (err) {
    next(err);
  }
};

// Create new batch
exports.createBatch = async (req, res, next) => {
  try {
    const { batch_code, program_id, academic_year, admission_id } = req.body;
    
    const batchId = await batchService.createBatch({
      batch_code,
      program_id,
      academic_year,
      admission_id,
      create_by: req.user?.id || 1
    });

    res.status(201).json({ 
      message: 'Batch created successfully', 
      id: batchId 
    });
  } catch (err) {
    next(err);
  }
};

// Update batch
exports.updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    await batchService.updateBatch(id, {
      ...req.body,
      updated_by: req.user?.id || 1
    });
    res.json({ message: 'Batch updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete batch
exports.deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    await batchService.deleteBatch(id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get admissions
exports.getAdmissions = async (req, res, next) => {
  try {
    const admissions = await batchService.getAdmissions();
    res.json(admissions);
  } catch (err) {
    next(err);
  }
};
