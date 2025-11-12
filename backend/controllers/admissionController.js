const admissionService = require('../services/admissionService');

// Get all admissions
exports.getAdmissions = async (req, res, next) => {
  try {
    const admissions = await admissionService.getAllAdmissions();
    res.json(admissions);
  } catch (err) {
    next(err);
  }
};

// Get admission by ID
exports.getAdmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admission = await admissionService.getAdmissionById(id);
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    res.json(admission);
  } catch (err) {
    next(err);
  }
};

// Create new admission
exports.createAdmission = async (req, res, next) => {
  try {
    const { admission_year, start_date, end_date } = req.body;
    
    const admissionId = await admissionService.createAdmission({
      admission_year,
      start_date,
      end_date,
      created_by: req.user?.id || 1
    });

    res.status(201).json({ 
      message: 'Admission created successfully', 
      id: admissionId 
    });
  } catch (err) {
    next(err);
  }
};

// Update admission
exports.updateAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    await admissionService.updateAdmission(id, req.body);
    res.json({ message: 'Admission updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete admission
exports.deleteAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    await admissionService.deleteAdmission(id);
    res.json({ message: 'Admission deleted successfully' });
  } catch (err) {
    next(err);
  }
};
