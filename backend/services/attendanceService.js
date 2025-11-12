const attendanceRepository = require('../repositories/attendanceRepository');

const attendanceService = {
  async getAllAttendance() {
    return await attendanceRepository.findAll();
  },

  async getAttendanceById(id) {
    return await attendanceRepository.findById(id);
  },

  async createAttendance(attendanceData) {
    return await attendanceRepository.create(attendanceData);
  },

  async updateAttendance(id, attendanceData) {
    return await attendanceRepository.update(id, attendanceData);
  },

  async deleteAttendance(id) {
    return await attendanceRepository.delete(id);
  },

  async getStatusTypes() {
    return await attendanceRepository.getStatusTypes();
  },

  async getStudents() {
    return await attendanceRepository.getStudents();
  },

  async getSubjectEnrollments() {
    return await attendanceRepository.getSubjectEnrollments();
  },

  async getAttendanceByFilters(filters) {
    return await attendanceRepository.findByFilters(filters);
  },

  async getAttendanceByClassAndDate(subjectEnrollId, date) {
    return await attendanceRepository.findByClassAndDate(subjectEnrollId, date);
  },

  async saveBulkAttendance(records, modifiedBy) {
    return await attendanceRepository.saveBulk(records, modifiedBy);
  },

  async getAttendanceByStudent(studentId, subjectEnrollId = null) {
    return await attendanceRepository.findByStudent(studentId, subjectEnrollId);
  },

  async getMyAttendanceClasses(studentId) {
    return await attendanceRepository.getStudentActiveClassesWithAttendance(studentId);
  },

  async getMyClassAttendance(studentId, subjectEnrollId) {
    return await attendanceRepository.getStudentClassAttendance(studentId, subjectEnrollId);
  }
};

module.exports = attendanceService;
