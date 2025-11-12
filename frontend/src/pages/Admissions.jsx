import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import '../styles/table.css';
import '../styles/modal.css';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
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
      alert('Failed to load admissions: ' + err.message);
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
      alert('Admission deleted successfully');
      loadData();
    } catch (err) {
      console.error('Error deleting admission:', err);
      alert('Failed to delete admission: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form:', form);

    // Validation
    if (!form.admission_year || !form.start_date || !form.end_date) {
      alert('Please fill in all required fields');
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
        alert('Admission updated successfully');
      } else {
        await api.createAdmission(payload);
        alert('Admission created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving admission:', err);
      alert('Failed to save admission: ' + err.message);
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
      <div className="page-container">
        <div className="page-header">
          <div className="header-text">
            <h1>Admission Management</h1>
            <p className="page-subtitle">Manage academic admission periods and schedules</p>
          </div>
          <button className="btn" style={{ width: '140px', height: '36px' }} onClick={handleAdd}>
            + Add Admission
          </button>
        </div>

        <div className="card">
          <div className="page-actions">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search admissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="btn-cancel" onClick={clearSearch}>Clear</button>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <span style={{ fontSize: '24px' }}>🎓</span>
              <div>
                <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '500' }}>Total Admissions</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0c4a6e' }}>{filteredAdmissions.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Admission Year</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : filteredAdmissions.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No admissions found</td></tr>
                ) : (
                  filteredAdmissions.map(admission => (
                    <tr key={admission.id}>
                      <td>
                        <span className="badge badge-primary">{admission.admission_year}</span>
                      </td>
                      <td>{admission.start_date ? new Date(admission.start_date).toLocaleDateString() : '-'}</td>
                      <td>{admission.end_date ? new Date(admission.end_date).toLocaleDateString() : '-'}</td>
                      <td>{admission.created_by_name || '-'}</td>
                      <td>
                        <button className="btn-action edit" onClick={() => handleEdit(admission)}>Edit</button>
                        <button className="btn-action delete" onClick={() => handleDelete(admission.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" style={{maxWidth:600}} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Admission' : 'Add New Admission'}</h2>
                <button className="close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="admissionForm">
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">🎓</span>
                      Admission Information
                    </h3>
                    <div className="form-grid-vertical">
                      <div className="form-field">
                        <label className="form-label">Admission Year <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., 2024-2025"
                          value={form.admission_year}
                          onChange={(e) => handleChange('admission_year', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">Start Date <span className="required">*</span></label>
                        <input
                          type="date"
                          className="form-input"
                          value={form.start_date}
                          onChange={(e) => handleChange('start_date', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">End Date <span className="required">*</span></label>
                        <input
                          type="date"
                          className="form-input"
                          value={form.end_date}
                          onChange={(e) => handleChange('end_date', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" form="admissionForm" className="btn">
                  {editingId ? 'Update Admission' : 'Add Admission'}
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
