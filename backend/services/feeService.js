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
  },

  async updateFeePayment(paymentId, paymentData) {
    return await feeRepository.updatePayment(paymentId, paymentData);
  },

  async deleteFeePayment(paymentId) {
    return await feeRepository.deletePayment(paymentId);
  }
};

module.exports = feeService;
