import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import { useAlert } from '../contexts/AlertContext';

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
`;
if (!document.head.querySelector('style[data-fees-animations]')) {
  styleSheet.setAttribute('data-fees-animations', 'true');
  document.head.appendChild(styleSheet);
}

export default function Fees() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFeeDetails, setStudentFeeDetails] = useState({ payments: [], stats: {} });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Cash',
    pay_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllStudentsForFees(searchTerm);
      if (response.success) {
        console.log('Students loaded, sample:', response.data[0]);
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      showError('Failed to load students: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, showError]);

  const loadInitialData = useCallback(async () => {
    try {
      const [deptsRes, batchesRes, programsRes] = await Promise.all([
        api.getDepartments(),
        api.getBatches(),
        api.getPrograms()
      ]);
      setDepartments(deptsRes || []);
      setBatches(batchesRes || []);
      setPrograms(programsRes || []);
      await loadStudents();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, [loadStudents]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter batches by department through programs (same logic as Students and GenerateCard pages)
  const filteredBatches = selectedDepartment
    ? (() => {
        const deptPrograms = programs.filter(p => String(p.department_id) === String(selectedDepartment));
        if (deptPrograms.length > 0) {
          const programIds = new Set(deptPrograms.map(p => String(p.program_id || p.id)));
          return batches.filter(b => {
            const batchProgramId = String(b.program_id || b.ProgramId || b.programId || '');
            return batchProgramId && programIds.has(batchProgramId);
          });
        }
        return [];
      })()
    : batches;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedBatch('');
    setCurrentPage(1);
  };

  const handleAddFee = (student) => {
    setSelectedStudent(student);
    setIsEditMode(false);
    setEditingPayment(null);
    setPaymentData({
      amount: '',
      payment_method: 'Cash',
      pay_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const handleEditPayment = (payment) => {
    setIsEditMode(true);
    setEditingPayment(payment);
    setPaymentData({
      amount: payment.amount,
      payment_method: payment.payment_method,
      pay_date: payment.pay_date,
      description: payment.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      const response = await api.deleteFeePayment(paymentToDelete.id);
      if (response.success) {
        showSuccess('Payment deleted successfully!');
        setShowDeleteConfirm(false);
        setPaymentToDelete(null);
        // Refresh the details
        await handleViewDetails(selectedStudent);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      showError('Failed to delete payment: ' + error.message);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPaymentToDelete(null);
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
      showError('Failed to load fee details: ' + error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      showWarning('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      
      if (isEditMode && editingPayment) {
        // Update existing payment
        const response = await api.updateFeePayment(editingPayment.id, {
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          pay_date: paymentData.pay_date,
          description: paymentData.description
        });

        if (response.success) {
          showSuccess('Fee payment updated successfully!');
          setShowModal(false);
          // Refresh details if modal is open
          if (showDetailsModal) {
            await handleViewDetails(selectedStudent);
          }
          loadStudents();
        }
      } else {
        // Create new payment
        const response = await api.createFeePayment({
          student_id: selectedStudent.id,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          pay_date: paymentData.pay_date,
          description: paymentData.description
        });

        if (response.success) {
          showSuccess('Fee payment added successfully!');
          setShowModal(false);
          // Refresh details if modal is open
          if (showDetailsModal) {
            await handleViewDetails(selectedStudent);
          }
          loadStudents();
        }
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      showError('Failed to save payment: ' + error.message);
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

        {/* Search and Filter Box */}
        <div style={{
          background: 'white',
          padding: '28px',
          borderRadius: '20px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              margin: '0 0 6px 0', 
              fontSize: '1.2rem', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🔍</span>
              Search & Filter Students
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Find students by name, code, or filter by department and batch
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name, student code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingLeft: '44px',
                  fontSize: '0.95rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.25rem'
              }}>🔍</span>
            </div>

            {/* Department Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingLeft: '44px',
                  fontSize: '0.95rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.25rem',
                pointerEvents: 'none'
              }}>🏢</span>
            </div>

            {/* Batch Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingLeft: '44px',
                  fontSize: '0.95rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">{selectedDepartment ? 'All Batches in Department' : 'All Batches'}</option>
                {filteredBatches.map(batch => (
                  <option key={batch.Id} value={batch.Id}>
                    {batch.batch_code} ({batch.academic_year})
                  </option>
                ))}
              </select>
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.25rem',
                pointerEvents: 'none'
              }}>🎓</span>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedDepartment || selectedBatch) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              🗑️ Clear All Filters
            </button>
          )}
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
          <>
            {/* Pagination Info & Controls Top */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '16px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '2px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' }}>
                  Show
                </span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' }}>
                  entries
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: '600' }}>
                Total Students: <span style={{ 
                  color: '#667eea', 
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>{(() => {
                  // Client-side filtering (same as Students page)
                  const filtered = students.filter(student => {
                    const matchesDepartment = !selectedDepartment || String(student.department_id) === String(selectedDepartment);
                    const matchesBatch = !selectedBatch || String(student.batch_id) === String(selectedBatch);
                    return matchesDepartment && matchesBatch;
                  });
                  return filtered.length;
                })()}</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      <th style={{ padding: '18px 16px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem', width: '60px' }}>No</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Student Code</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>English Name</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Khmer Name</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Gender</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Batch</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Department</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Scholarship</th>
                      <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.95rem' }}>Phone</th>
                      <th style={{ padding: '18px 16px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Client-side filtering (same as Students page)
                      const filtered = students.filter(student => {
                        const matchesDepartment = !selectedDepartment || String(student.department_id) === String(selectedDepartment);
                        const matchesBatch = !selectedBatch || String(student.batch_id) === String(selectedBatch);
                        return matchesDepartment && matchesBatch;
                      });
                      return filtered
                        .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                        .map((student, index) => (
                      <tr 
                        key={student.id}
                        style={{
                          background: index % 2 === 0 ? '#f9fafb' : 'white',
                          transition: 'all 0.2s',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(90deg, #f0f9ff 0%, #fef3f2 100%)';
                          e.currentTarget.style.transform = 'scale(1.01)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? '#f9fafb' : 'white';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td style={{ padding: '16px', fontWeight: '700', color: '#667eea', fontSize: '0.95rem' }}>
                          {student.student_code}
                        </td>
                        <td style={{ padding: '16px', color: '#1f2937', fontWeight: '600', fontSize: '0.95rem' }}>
                          {student.std_eng_name}
                        </td>
                        <td style={{ padding: '16px', color: '#1f2937', fontSize: '0.9rem' }}>
                          {student.std_khmer_name}
                        </td>
                        <td style={{ padding: '16px', color: '#6b7280', fontSize: '0.9rem' }}>
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
                        {student.scholarship_name || 'None'}
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
                  ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls Bottom */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              padding: '16px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '2px solid #f3f4f6'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
                {(() => {
                  const filtered = students.filter(student => {
                    const matchesDepartment = !selectedDepartment || String(student.department_id) === String(selectedDepartment);
                    const matchesBatch = !selectedBatch || String(student.batch_id) === String(selectedBatch);
                    return matchesDepartment && matchesBatch;
                  });
                  return `Showing ${((currentPage - 1) * entriesPerPage) + 1} to ${Math.min(currentPage * entriesPerPage, filtered.length)} of ${filtered.length} entries`;
                })()}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 18px',
                    background: currentPage === 1 ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: currentPage === 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  ← Previous
                </button>
                
                {(() => {
                  const totalPages = Math.ceil(students.length / entriesPerPage);
                  const pageButtons = [];
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pageButtons.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        style={{
                          padding: '10px 16px',
                          background: currentPage === i 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'white',
                          color: currentPage === i ? 'white' : '#667eea',
                          border: currentPage === i ? 'none' : '2px solid #667eea',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '0.9rem',
                          minWidth: '44px'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== i) {
                            e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== i) {
                            e.target.style.background = 'white';
                            e.target.style.color = '#667eea';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pageButtons;
                })()}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(students.length / entriesPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(students.length / entriesPerPage)}
                  style={{
                    padding: '10px 18px',
                    background: currentPage === Math.ceil(students.length / entriesPerPage) ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: currentPage === Math.ceil(students.length / entriesPerPage) ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: currentPage === Math.ceil(students.length / entriesPerPage) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== Math.ceil(students.length / entriesPerPage)) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Fee Modal */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '36px',
              width: '90%',
              maxWidth: '550px',
              boxShadow: '0 24px 80px rgba(102, 126, 234, 0.25)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              marginBottom: '28px',
              paddingBottom: '20px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <h2 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '1.75rem', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '2rem' }}>{isEditMode ? '✏️' : '💰'}</span>
                {isEditMode ? 'Edit Fee Payment' : 'Add Fee Payment'}
              </h2>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: '#6b7280',
                fontWeight: '500',
                lineHeight: '1.6'
              }}>
                Student: <strong style={{ color: '#667eea' }}>{selectedStudent?.std_eng_name}</strong>
                <span style={{ 
                  display: 'inline-block',
                  margin: '0 8px',
                  padding: '2px 10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {selectedStudent?.student_code}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  marginBottom: '10px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  💵 Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount..."
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  marginBottom: '10px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  💳 Payment Method *
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    fontWeight: '600',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="Credit Card">💳 Credit Card</option>
                  <option value="ABA">📱 ABA</option>
                  <option value="Wing">🦅 Wing</option>
                  <option value="Other">📋 Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  marginBottom: '10px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📅 Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentData.pay_date}
                  onChange={(e) => setPaymentData({ ...paymentData, pay_date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ 
                  marginBottom: '10px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📝 Description
                </label>
                <textarea
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                  rows={4}
                  placeholder="Add optional notes or details about this payment..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '0.95rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    border: '2px solid #ef4444',
                    background: 'white',
                    color: '#ef4444',
                    borderRadius: '12px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: submitting ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.target.style.background = 'white';
                      e.target.style.color = '#ef4444';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  ✖ Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    border: 'none',
                    background: submitting 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: submitting 
                      ? 'none' 
                      : '0 4px 16px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                >
                  {submitting ? 'Processing...' : (isEditMode ? '✓ Update Payment' : '✓ Add Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            overflow: 'auto',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              width: '90%',
              maxWidth: '950px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 24px 80px rgba(102, 126, 234, 0.25)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              marginBottom: '32px', 
              paddingBottom: '24px',
              borderBottom: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box'
            }}>
              <h2 style={{ 
                margin: '0 0 14px 0', 
                fontSize: '2rem', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '2.2rem' }}>📊</span>
                Fee Payment Details
              </h2>
              <p style={{ 
                margin: 0, 
                fontSize: '1rem', 
                color: '#6b7280',
                fontWeight: '500',
                lineHeight: '1.8'
              }}>
                <strong style={{ color: '#667eea', fontSize: '1.1rem' }}>{selectedStudent?.std_eng_name}</strong>
                <span style={{ 
                  display: 'inline-block',
                  margin: '0 8px',
                  padding: '3px 12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {selectedStudent?.student_code}
                </span>
                <br/>
                <span style={{ fontSize: '0.9rem' }}>
                  🎓 Batch: <strong>{selectedStudent?.batch_name || 'N/A'}</strong> | 
                  🏢 Department: <strong>{selectedStudent?.department_name || 'N/A'}</strong> |
                  🎖️ Scholarship: <strong>{selectedStudent?.scholarship_name || 'None'}</strong>
                </span>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '28px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💳</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '6px' }}>
                      {studentFeeDetails.stats.total_payments || 0}
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.95, fontWeight: '600' }}>Total Payments</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '28px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💰</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '6px' }}>
                      {formatCurrency(studentFeeDetails.stats.total_paid || 0)}
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.95, fontWeight: '600' }}>Total Paid</div>
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
                    <div style={{ display: 'grid', gap: '14px', maxHeight: '450px', overflow: 'auto', padding: '4px' }}>
                      {studentFeeDetails.payments.map((payment) => (
                        <div
                          key={payment.id}
                          style={{
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '14px',
                            padding: '18px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                          }}
                        >
                          <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            flexShrink: 0
                          }}>
                            <span role="img" aria-label="money">💵</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>
                                {formatCurrency(payment.amount)}
                              </span>
                              <span style={{
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: '2px solid #93c5fd',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span role="img" aria-label="payment">💳</span>
                                {payment.payment_method}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', gap: '16px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span role="img" aria-label="calendar">📅</span>
                                {formatDate(payment.pay_date)}
                              </span>
                              {payment.made_by_name && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span role="img" aria-label="user">👤</span>
                                  {payment.made_by_name}
                                </span>
                              )}
                            </div>
                            {payment.description && (
                              <div style={{
                                marginTop: '10px',
                                background: '#fef3c7',
                                border: '1px solid #fcd34d',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                fontSize: '0.85rem',
                                color: '#92400e',
                                display: 'flex',
                                gap: '8px'
                              }}>
                                <span role="img" aria-label="note">📝</span>
                                <span>{payment.description}</span>
                              </div>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            alignItems: 'center',
                            flexShrink: 0
                          }}>
                            <div style={{
                              background: '#f3f4f6',
                              border: '2px solid #e5e7eb',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              textAlign: 'center',
                              minWidth: '90px'
                            }}>
                              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                                RECORDED
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700' }}>
                                {new Date(payment.pay_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditPayment(payment)}
                                title="Edit Payment"
                                style={{
                                  padding: '10px 14px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
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
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(payment)}
                                title="Delete Payment"
                                style={{
                                  padding: '10px 14px',
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                                }}
                              >
                                🗑️ Delete
                              </button>
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
            <div style={{ 
              marginTop: '32px', 
              paddingTop: '24px',
              borderTop: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box'
            }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 6px 24px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                }}
              >
                ✖ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && paymentToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            animation: 'fadeIn 0.2s ease-out',
            padding: '20px'
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 24px 80px rgba(239, 68, 68, 0.35)',
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: 'slideUp 0.3s ease-out',
              transform: 'scale(1)',
              transition: 'transform 0.2s'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                animation: 'pulse 2s infinite'
              }}>
                ⚠️
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '1.75rem',
              fontWeight: '800',
              color: '#dc2626',
              textAlign: 'center',
              lineHeight: '1.3'
            }}>
              Delete Payment?
            </h2>

            {/* Message */}
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '1rem',
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Are you sure you want to delete this payment record?
              <br />
              <strong style={{ color: '#374151' }}>This action cannot be undone.</strong>
            </p>

            {/* Payment Info Card */}
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '28px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  💵
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#dc2626',
                    marginBottom: '4px'
                  }}>
                    {formatCurrency(paymentToDelete.amount)}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span>💳 {paymentToDelete.payment_method}</span>
                    <span>📅 {formatDate(paymentToDelete.pay_date)}</span>
                  </div>
                </div>
              </div>
              {paymentToDelete.description && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #fecaca',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  "{paymentToDelete.description}"
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '16px 24px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  border: '2px solid #d1d5db',
                  background: 'white',
                  color: '#6b7280',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                ✖ Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '16px 24px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)';
                }}
              >
                🗑️ Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
