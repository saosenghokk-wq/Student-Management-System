const feeService = require('../services/feeService');

const feeController = {
  // Get student's fee payments (for student role)
  async getMyFeePayments(req, res) {
    try {
      const studentId = req.user.student_id;
      
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID not found' });
      }

      const payments = await feeService.getMyFeePayments(studentId);
      const stats = await feeService.getMyFeeStats(studentId);
      
      res.json({ 
        success: true, 
        data: {
          payments,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching fee payments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch fee payments' });
    }
  },

  // Get all students for fee management (for admin/accountant)
  async getAllStudents(req, res) {
    try {
      const { search } = req.query;
      const students = await feeService.getAllStudents(search || '');
      
      res.json({ 
        success: true, 
        data: students
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
  },

  // Create fee payment (for admin/accountant)
  async createFeePayment(req, res) {
    try {
      const { student_id, amount, payment_method, pay_date, description } = req.body;
      
      if (!student_id || !amount || !payment_method || !pay_date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: student_id, amount, payment_method, pay_date' 
        });
      }

      const paymentData = {
        student_id,
        amount,
        payment_method,
        pay_date,
        make_by: req.user.id, // Admin/accountant who created the payment
        description: description || null
      };

      const payment = await feeService.createFeePayment(paymentData);
      
      res.json({ 
        success: true, 
        message: 'Fee payment created successfully',
        data: payment
      });
    } catch (error) {
      console.error('Error creating fee payment:', error);
      res.status(500).json({ success: false, message: 'Failed to create fee payment' });
    }
  },

  // Get student fee details (for admin/accountant)
  async getStudentFeeDetails(req, res) {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
      }

      const payments = await feeService.getMyFeePayments(studentId);
      const stats = await feeService.getMyFeeStats(studentId);
      
      res.json({ 
        success: true, 
        data: {
          payments,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching student fee details:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student fee details' });
    }
  },

  // Update fee payment (for admin/accountant)
  async updateFeePayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount, payment_method, pay_date, description } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'Payment ID is required' });
      }

      if (!amount || !payment_method || !pay_date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: amount, payment_method, pay_date' 
        });
      }

      const paymentData = {
        amount,
        payment_method,
        pay_date,
        description: description || null
      };

      const updated = await feeService.updateFeePayment(paymentId, paymentData);
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      res.json({ 
        success: true, 
        message: 'Fee payment updated successfully'
      });
    } catch (error) {
      console.error('Error updating fee payment:', error);
      res.status(500).json({ success: false, message: 'Failed to update fee payment' });
    }
  },

  // Delete fee payment (for admin/accountant)
  async deleteFeePayment(req, res) {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'Payment ID is required' });
      }

      const deleted = await feeService.deleteFeePayment(paymentId);
      
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      res.json({ 
        success: true, 
        message: 'Fee payment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting fee payment:', error);
      res.status(500).json({ success: false, message: 'Failed to delete fee payment' });
    }
  },

  // Get student fee payments (for parent/admin viewing specific student)
  async getStudentFeePayments(req, res) {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
      }

      const payments = await feeService.getMyFeePayments(studentId);
      const stats = await feeService.getMyFeeStats(studentId);
      
      res.json({ 
        success: true, 
        data: {
          payments,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching student fee payments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student fee payments' });
    }
  }
};

module.exports = feeController;
