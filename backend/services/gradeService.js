const gradeRepository = require('../repositories/gradeRepository');

const gradeService = {
  async getAllGrades() {
    return await gradeRepository.findAll();
  },

  async getGradeById(id) {
    return await gradeRepository.findById(id);
  },

  async createGrade(gradeData) {
    return await gradeRepository.create(gradeData);
  },

  async updateGrade(id, gradeData) {
    return await gradeRepository.update(id, gradeData);
  },

  async deleteGrade(id) {
    return await gradeRepository.delete(id);
  },

  async getGradeTypes() {
    return await gradeRepository.getGradeTypes();
  },

  async getGradesByClass(subjectEnrollId, gradeTypeId = null) {
    return await gradeRepository.findByClass(subjectEnrollId, gradeTypeId);
  },

  async getGradesByStudent(studentId, subjectEnrollId = null) {
    return await gradeRepository.findByStudent(studentId, subjectEnrollId);
  },

  async saveBulkGrades(records, gradedBy) {
    return await gradeRepository.saveBulk(records, gradedBy);
  },

  async getStudentActiveClasses(studentId) {
    return await gradeRepository.getStudentActiveClasses(studentId);
  },

  async getStudentClassGrades(studentId, subjectEnrollId) {
    return await gradeRepository.getStudentClassGrades(studentId, subjectEnrollId);
  }
};

module.exports = gradeService;
