import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Batches() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [batches, setBatches] = useState([]);
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user') || sessionStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [programs, setPrograms] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    batch_code: '',
    program_id: '',
    academic_year: new Date().getFullYear(),
    admission_id: ''
  });

  // Permission check: only admin (role_id 1) and dean (role_id 2) can view
  let forbidden = !user || (user.role_id !== 1 && user.role_id !== 2);
  // ...existing code...
  // Place permission check and return here, just before main return

  useEffect(() => {
    loadData();
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

        {/* Search */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="page-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search by batch code, program, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: '0 1 320px', minWidth: '220px' }}
            />
            {searchQuery && (
              <button className="btn btn-cancel" onClick={() => setSearchQuery('')} style={{ padding: '10px 16px' }}>
                ✕ Clear
              </button>
            )}
          </div>

          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
            borderRadius: '10px',
            fontSize: '0.85rem', 
            color: '#0c4a6e', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{fontSize:'1.2rem'}}>📚</span>
            Showing <strong>{filteredBatches.length}</strong> of <strong>{batches.length}</strong> batches
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Program</th>
                  <th>Department</th>
                  <th>Academic Year</th>
                  <th>Admission Year</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.Id}>
                    <td>
                      <div style={{fontWeight:600}}>{batch.batch_code}</div>
                      <div style={{fontSize:'.75rem',color:'#64748b'}}>ID: {batch.Id}</div>
                    </td>
                    <td>
                      <div style={{fontWeight:600}}>{batch.program_code}</div>
                      <div style={{fontSize:'.75rem',color:'#64748b'}}>{batch.program_name}</div>
                    </td>
                    <td>{batch.department_name || '-'}</td>
                    <td>
                      <span className={`badge success`}>
                        {batch.academic_year}
                      </span>
                    </td>
                    <td>{batch.admission_year}</td>
                    <td style={{textAlign:'center'}}>
                      <button className="btn btn-sm" onClick={() => handleEdit(batch)} style={{marginRight:4}}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-cancel" onClick={() => handleDelete(batch.Id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
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
