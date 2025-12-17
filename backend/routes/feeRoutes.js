const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// Student role - Get my fee payments
router.get('/my-payments', feeController.getMyFeePayments);

// Admin/Accountant role - Get all students for fee management
router.get('/students', feeController.getAllStudents);

// Admin/Accountant role - Create fee payment
router.post('/payments', feeController.createFeePayment);

// Admin/Accountant role - Update fee payment
router.put('/payments/:paymentId', feeController.updateFeePayment);

// Admin/Accountant role - Delete fee payment
router.delete('/payments/:paymentId', feeController.deleteFeePayment);

// Admin/Accountant role - Get student fee details
router.get('/student/:studentId', feeController.getStudentFeeDetails);

module.exports = router;
