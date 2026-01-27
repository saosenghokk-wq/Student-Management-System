import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Batches() {
  const { showSuccess, showError } = useAlert();
  const [batches, setBatches] = useState([]);
  const [user] = useState(() => {
    const u = localStorage.getItem('user') || sessionStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [programs, setPrograms] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [form, setForm] = useState({
    batch_code: '',
    program_id: '',
    academic_year: new Date().getFullYear(),
    admission_id: ''
  });

  // Permission check: only admin (role_id 1) and dean (role_id 2) can view
  // let forbidden = !user || (user.role_id !== 1 && user.role_id !== 2);
  // ...existing code...
  // Place permission check and return here, just before main return

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const results = await Promise.all([
        api.getAllBatches().catch(err => { console.error('❌ Batches error:', err); return []; }),
        api.getPrograms().catch(err => { console.error('❌ Programs error:', err); return []; }),
        api.getAdmissions().catch(err => { console.error('❌ Admissions error:', err); return []; })
      ]);
      
      setBatches(results[0]);
      setPrograms(results[1]);
      setAdmissions(results[2]);
      
      console.log('✅ Batches loaded:', results[0]?.length || 0);
      console.log('✅ Programs loaded:', results[1]?.length || 0);
      console.log('✅ Admissions loaded:', results[2]?.length || 0);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      showError('Failed to load data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateBatch(editingId, form);
        showSuccess('Batch updated successfully');
      } else {
        await api.createBatch(form);
        showSuccess('Batch created successfully');
      }
      loadData();
      closeModal();
    } catch (err) {
      showError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (batch) => {
    setEditingId(batch.Id);
    setForm({
      batch_code: batch.batch_code,
      program_id: batch.program_id,
      academic_year: batch.academic_year,
      admission_id: batch.admission_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await api.deleteBatch(id);
      showSuccess('Batch deleted successfully');
      loadData();
    } catch (err) {
      showError(err.message || 'Delete failed');
    }
  };

  const openModal = () => {
    setEditingId(null);
    setForm({
      batch_code: '',
      program_id: '',
      academic_year: new Date().getFullYear(),
      admission_id: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const filteredBatches = batches.filter(b =>
    (
      (!user || user.role !== 'dean' || b.department_id === user.department_id) &&
      (
        b.batch_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.program_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.program_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.admission_year?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  if (loading) return <DashboardLayout><div className="loader">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Batch Management</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>
              Manage program batches and academic years
            </p>
          </div>
          <button 
            className="btn" 
            onClick={openModal}
            style={{ width: '140px', height: '36px', padding: '0' }}
          >
            + Add Batch
          </button>
        </div>

        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Search Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            padding: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📚</span> Batches List
              </h3>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
                {filteredBatches.length} batches
              </span>
            </div>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.1rem'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  fontSize: '0.95rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
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
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Batch Code</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Program</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Academic Year</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Admission Year</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.slice(0, entriesPerPage).map((batch, index) => (
                  <tr key={batch.Id} style={{
                    borderBottom: index < filteredBatches.length - 1 ? '1px solid #f3f4f6' : 'none',
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
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{batch.batch_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {batch.Id}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{batch.program_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{batch.program_name}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                      {batch.department_name || '-'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <span style={{
                        padding: '6px 16px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {batch.academic_year}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#1f2937' }}>
                      {batch.admission_year}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(batch)}
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
                        onClick={() => handleDelete(batch.Id)}
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
                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '0.875rem' }}>
                      {searchQuery ? `No batches found matching "${searchQuery}"` : 'No batches yet. Click "Add Batch" to create a new record.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" style={{maxWidth:600}} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Batch' : 'Add New Batch'}</h2>
                <button className="close" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="batchForm">
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📚</span>
                      Batch Information
                    </h3>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label className="form-label">Batch Code <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          name="batch_code"
                          value={form.batch_code}
                          onChange={handleChange}
                          required
                          placeholder="e.g., B2024-CS-01"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Academic Year <span className="required">*</span></label>
                        <input
                          type="number"
                          className="form-input"
                          name="academic_year"
                          value={form.academic_year}
                          onChange={handleChange}
                          required
                          min="1"
                          max="2100"
                          placeholder={new Date().getFullYear()}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Program <span className="required">*</span></label>
                        <select
                          className="form-input"
                          name="program_id"
                          value={form.program_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{programs.length === 0 ? 'Loading...' : 'Select Program'}</option>
                          {programs.map((prog) => (
                            <option key={prog.id} value={prog.id}>
                              {prog.code} - {prog.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Admission <span className="required">*</span></label>
                        <select
                          className="form-input"
                          name="admission_id"
                          value={form.admission_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{admissions.length === 0 ? 'Loading...' : 'Select Admission'}</option>
                          {admissions.map((adm) => (
                            <option key={adm.id} value={adm.id}>
                              {adm.admission_year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" form="batchForm" className="btn">
                  {editingId ? 'Update Batch' : 'Add Batch'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
