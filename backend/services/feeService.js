const feeRepository = require('../repositories/feeRepository');
const studentRepository = require('../repositories/studentRepository');

const feeService = {
  async getMyFeePayments(studentId) {
    return await feeRepository.getStudentFeePayments(studentId);
  },

  async getMyFeeStats(studentId) {
    return await feeRepository.getStudentFeeStats(studentId);
  },

  async getAllStudents(search) {
    return await studentRepository.getAllWithDetails(search);
  },

  async createFeePayment(paymentData) {
    return await feeRepository.createPayment(paymentData);
  }
};

module.exports = feeService;
