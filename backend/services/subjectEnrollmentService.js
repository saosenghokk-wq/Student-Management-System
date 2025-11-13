const subjectEnrollmentRepository = require('../repositories/subjectEnrollmentRepository');

class SubjectEnrollmentService {
  async getAllSubjectEnrollments(departmentId = null) {
    return await subjectEnrollmentRepository.findAll(departmentId);
  }

  async getSubjectEnrollmentById(id) {
    return await subjectEnrollmentRepository.findById(id);
  }

  async createSubjectEnrollment(data) {
    return await subjectEnrollmentRepository.create(data);
  }

  async updateSubjectEnrollment(id, data) {
    return await subjectEnrollmentRepository.update(id, data);
  }

  async deleteSubjectEnrollment(id) {
    return await subjectEnrollmentRepository.delete(id);
  }

  async getStatuses() {
    return await subjectEnrollmentRepository.getStatuses();
  }
}

module.exports = new SubjectEnrollmentService();
