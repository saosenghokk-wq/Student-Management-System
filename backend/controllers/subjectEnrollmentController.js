const subjectEnrollmentService = require('../services/subjectEnrollmentService');

// Get all subject enrollments
exports.getSubjectEnrollments = async (req, res, next) => {
  try {
    // If user is a dean (role_id = 2), filter by their department_id
    const departmentId = req.user?.role_id === 2 ? req.user.department_id : null;
    const enrollments = await subjectEnrollmentService.getAllSubjectEnrollments(departmentId);
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};

// Get subject enrollment by ID
exports.getSubjectEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await subjectEnrollmentService.getSubjectEnrollmentById(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Subject enrollment not found' });
    }
    res.json(enrollment);
  } catch (err) {
    next(err);
  }
};

// Create new subject enrollment
exports.createSubjectEnrollment = async (req, res, next) => {
  try {
    const created_by = req.user?.id || 1; // Get from authenticated user
    const data = { ...req.body, created_by };
    
    const id = await subjectEnrollmentService.createSubjectEnrollment(data);
    res.status(201).json({ message: 'Subject enrollment created successfully', id });
  } catch (err) {
    next(err);
  }
};

// Update subject enrollment
exports.updateSubjectEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await subjectEnrollmentService.updateSubjectEnrollment(id, req.body);
    res.json({ message: 'Subject enrollment updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete subject enrollment
exports.deleteSubjectEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await subjectEnrollmentService.deleteSubjectEnrollment(id);
    res.json({ message: 'Subject enrollment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get enrollment statuses
exports.getStatuses = async (req, res, next) => {
  try {
    const statuses = await subjectEnrollmentService.getStatuses();
    res.json(statuses);
  } catch (err) {
    next(err);
  }
};
