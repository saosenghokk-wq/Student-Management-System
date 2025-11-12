import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';

export default function Fees() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFeeDetails, setStudentFeeDetails] = useState({ payments: [], stats: {} });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Cash',
    pay_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.getAllStudentsForFees(searchTerm);
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Failed to load students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = (student) => {
    setSelectedStudent(student);
    setPaymentData({
      amount: '',
      payment_method: 'Cash',
      pay_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      const response = await api.getStudentFeeDetails(student.id);
      if (response.success) {
        setStudentFeeDetails(response.data);
      }
    } catch (error) {
      console.error('Error loading fee details:', error);
      alert('Failed to load fee details: ' + error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createFeePayment({
        student_id: selectedStudent.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        pay_date: paymentData.pay_date,
        description: paymentData.description
      });

      if (response.success) {
        alert('Fee payment added successfully!');
        setShowModal(false);
        loadStudents();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '30px 40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '2rem', 
            fontWeight: '800', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '2rem' }}>💰</span>
            Fee Management
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            color: '#64748b',
            fontWeight: '500'
          }}>
            Manage student fee payments
          </p>
        </div>

        {/* Search Box */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, student code, batch, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div className="spinner" style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>👥</div>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#374151' 
            }}>
              No Students Found
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '1rem', 
              color: '#6b7280' 
            }}>
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Student Code</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>English Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Khmer Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Gender</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Batch</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Department</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Phone</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr 
                      key={student.id}
                      style={{
                        background: index % 2 === 0 ? '#f9fafb' : 'white',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#f9fafb' : 'white'}
                    >
                      <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>
                        {student.student_code}
                      </td>
                      <td style={{ padding: '16px', color: '#1f2937' }}>
                        {student.std_eng_name}
                      </td>
                      <td style={{ padding: '16px', color: '#1f2937' }}>
                        {student.std_khmer_name}
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>
                        {student.gender === '0' ? '👨 Male' : '👩 Female'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {student.batch_name || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>
                        {student.department_name || 'N/A'}
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>
                        {student.phone || 'N/A'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewDetails(student)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                            }}
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleAddFee(student)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            💵 Add
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Fee Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.8rem' }}>💰</span>
                Add Fee Payment
              </h2>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: '#6b7280' 
              }}>
                Student: <strong>{selectedStudent?.std_eng_name}</strong> ({selectedStudent?.student_code})
              </p>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151' 
                }}>
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151' 
                }}>
                  Payment Method *
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="ABA">ABA</option>
                  <option value="Wing">Wing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151' 
                }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentData.pay_date}
                  onChange={(e) => setPaymentData({ ...paymentData, pay_date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151' 
                }}>
                  Description
                </label>
                <textarea
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                  rows={3}
                  placeholder="Optional notes..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    color: '#6b7280',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: submitting ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !submitting && (e.target.style.background = '#f9fafb')}
                  onMouseLeave={(e) => !submitting && (e.target.style.background = 'white')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: 'none',
                    background: submitting 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: submitting 
                      ? 'none' 
                      : '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !submitting && (e.target.style.transform = 'translateY(0)')}
                >
                  {submitting ? 'Processing...' : '✓ Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflow: 'auto',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.8rem' }}>📊</span>
                Fee Payment Details
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                <strong>{selectedStudent?.std_eng_name}</strong> ({selectedStudent?.student_code}) - 
                Batch: {selectedStudent?.batch_name || 'N/A'} | 
                Department: {selectedStudent?.department_name || 'N/A'}
              </p>
            </div>

            {loadingDetails ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '60px',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div className="spinner" style={{ 
                  width: '50px', 
                  height: '50px', 
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#6b7280' }}>Loading payment details...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                      {studentFeeDetails.stats.total_payments || 0}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Total Payments</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                      {formatCurrency(studentFeeDetails.stats.total_paid || 0)}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Total Paid</div>
                  </div>
                </div>

                {/* Payment History */}
                {studentFeeDetails.payments.length === 0 ? (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '60px 40px',
                    textAlign: 'center',
                    border: '2px dashed #e5e7eb'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>💳</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700', color: '#374151' }}>
                      No Payment Records
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                      This student hasn't made any fee payments yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '1.1rem', 
                      fontWeight: '700', 
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📜</span>
                      Payment History ({studentFeeDetails.payments.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflow: 'auto' }}>
                      {studentFeeDetails.payments.map((payment) => (
                        <div
                          key={payment.id}
                          style={{
                            background: '#f9fafb',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            gap: '16px',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                          }}>
                            💵
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981' }}>
                                {formatCurrency(payment.amount)}
                              </span>
                              <span style={{
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: '2px solid #93c5fd',
                                padding: '2px 10px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                              }}>
                                {payment.payment_method}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '12px' }}>
                              <span>📅 {formatDate(payment.pay_date)}</span>
                              {payment.made_by_name && <span>👤 {payment.made_by_name}</span>}
                            </div>
                            {payment.description && (
                              <div style={{
                                marginTop: '8px',
                                background: '#fef3c7',
                                border: '1px solid #fcd34d',
                                borderRadius: '6px',
                                padding: '8px',
                                fontSize: '0.8rem',
                                color: '#92400e'
                              }}>
                                {payment.description}
                              </div>
                            )}
                          </div>
                          <div style={{
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'center',
                            minWidth: '80px'
                          }}>
                            <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '600' }}>
                              RECORDED
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#1f2937', fontWeight: '700' }}>
                              {new Date(payment.pay_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Close Button */}
            <div style={{ marginTop: '24px', borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
