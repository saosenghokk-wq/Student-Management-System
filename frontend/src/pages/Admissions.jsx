import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

const Admissions = () => {
  const { showSuccess, showError, showWarning } = useAlert();
  const [admissions, setAdmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [form, setForm] = useState({
    admission_year: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const admissionsData = await api.getAllAdmissions();
      console.log('Admissions loaded:', admissionsData);
      setAdmissions(admissionsData || []);
    } catch (err) {
      console.error('Error loading admissions:', err);
      showError('Failed to load admissions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({
      admission_year: '',
      start_date: '',
      end_date: ''
    });
    setShowModal(true);
  };

  const handleEdit = (admission) => {
    setEditingId(admission.id);
    setForm({
      admission_year: admission.admission_year || '',
      start_date: admission.start_date ? admission.start_date.split('T')[0] : '',
      end_date: admission.end_date ? admission.end_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission?')) return;
    try {
      await api.deleteAdmission(id);
      showSuccess('Admission deleted successfully');
      loadData();
    } catch (err) {
      console.error('Error deleting admission:', err);
      showError('Failed to delete admission: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form:', form);

    // Validation
    if (!form.admission_year || !form.start_date || !form.end_date) {
      showWarning('Please fill in all required fields');
      return;
    }

    const payload = {
      admission_year: form.admission_year.trim(),
      start_date: form.start_date,
      end_date: form.end_date
    };

    console.log('Payload:', payload);

    try {
      if (editingId) {
        await api.updateAdmission(editingId, payload);
        showSuccess('Admission updated successfully');
      } else {
        const newAdmission = await api.createAdmission(payload);
        setAdmissions(prev => [newAdmission, ...prev]);
        showSuccess('Admission created successfully');
      }
      setShowModal(false);
      if (editingId) loadData();
    } catch (err) {
      console.error('Error saving admission:', err);
      showError('Failed to save admission: ' + err.message);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Filter admissions by search query
  const filteredAdmissions = admissions.filter(admission => {
    const q = searchQuery.toLowerCase();
    return (
      (admission.admission_year && admission.admission_year.toLowerCase().includes(q)) ||
      (admission.start_date && admission.start_date.includes(q)) ||
      (admission.end_date && admission.end_date.includes(q)) ||
      (admission.created_by_name && admission.created_by_name.toLowerCase().includes(q))
    );
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🎓 Admission Management
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              margin: 0
            }}>
              Manage academic admission periods and schedules
            </p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Add Admission
          </button>
        </div>

        {/* Search and Stats Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 Search admissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  style={{
                    padding: '12px 20px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <span style={{ fontSize: '32px' }}>🎓</span>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600', letterSpacing: '0.5px' }}>
                  TOTAL ADMISSIONS
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                  {filteredAdmissions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #f3f4f6'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              Loading admissions...
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No admissions found</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first admission period'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleAdd}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Add First Admission
                </button>
              )}
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              background: '#fff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                color: '#fff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🎓</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Admission Periods</h3>
                <span style={{ 
                  marginLeft: 'auto', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: '0.875rem' 
                }}>
                  {filteredAdmissions.length} periods
                </span>
              </div>

              {/* Entries per page selector */}
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <label style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                  Show
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  style={{
                    padding: '6px 32px 6px 12px',
                    fontSize: '0.875rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <label style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                  entries per page
                </label>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '60px' }}>No.</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Admission Year</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Start Date</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>End Date</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Created By</th>
                      <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.slice(0, entriesPerPage).map((admission, index) => (
                      <tr key={admission.id} style={{
                        borderBottom: index < filteredAdmissions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ 
                          padding: '16px 20px', 
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                          <span style={{
                            padding: '6px 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {admission.admission_year}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#1f2937' }}>
                          {admission.start_date ? new Date(admission.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#1f2937' }}>
                          {admission.end_date ? new Date(admission.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {admission.created_by_name || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEdit(admission)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginRight: '8px',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.4)';
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(admission.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.4)';
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={() => setShowModal(false)}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                padding: '24px',
                borderBottom: '2px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '28px' }}>🎓</span>
                  {editingId ? 'Edit Admission' : 'Add New Admission'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.color = '#1f2937';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleSubmit} id="admissionForm">
                <div style={{ padding: '24px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '2px solid #bae6fd'
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Admission Year <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 2024-2025"
                        value={form.admission_year}
                        onChange={(e) => handleChange('admission_year', e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Start Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>

                    <div style={{ marginBottom: 0 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        End Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                </div>
              </form>
              
              {/* Modal Footer */}
              <div style={{
                padding: '20px 24px',
                borderTop: '2px solid #f3f4f6',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="admissionForm"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  {editingId ? '✓ Update Admission' : '+ Add Admission'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Admissions;
