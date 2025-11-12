const pool = require('../config/db').pool;

const feeRepository = {
  // Get student's fee payments with details
  async getStudentFeePayments(studentId) {
    const query = `
      SELECT 
        fp.id,
        fp.student_id,
        fp.amount,
        fp.payment_method,
        fp.pay_date,
        fp.description,
        fp.pay_at,
        u.username as made_by_name
      FROM fee_payment fp
      LEFT JOIN users u ON fp.make_by = u.id
      WHERE fp.student_id = ?
      ORDER BY fp.pay_date DESC, fp.pay_at DESC
    `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  },

  // Get fee payment statistics for student
  async getStudentFeeStats(studentId) {
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount), 0) as total_paid,
        MIN(pay_date) as first_payment_date,
        MAX(pay_date) as last_payment_date
      FROM fee_payment
      WHERE student_id = ?
    `;
    const [rows] = await pool.execute(query, [studentId]);
    return rows[0];
  },

  // Create new fee payment
  async createPayment(paymentData) {
    const query = `
      INSERT INTO fee_payment (student_id, amount, payment_method, pay_date, make_by, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      paymentData.student_id,
      paymentData.amount,
      paymentData.payment_method,
      paymentData.pay_date,
      paymentData.make_by,
      paymentData.description
    ]);
    return { id: result.insertId, ...paymentData };
  }
};

module.exports = feeRepository;
