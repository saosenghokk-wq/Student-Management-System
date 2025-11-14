import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function Subjects() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subject_code: '', subject_name: '', program_id: '', credit: ''
  });
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectData, progData] = await Promise.all([
        api.getSubjects(),
        api.getPrograms()
      ]);
      setSubjects(subjectData);
      setPrograms(progData);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const openAddModal = () => {
    setEditId(null);
    setForm({ subject_code: '', subject_name: '', program_id: '', credit: '' });
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!form.subject_code.trim()) return setError('Subject code is required');
    if (!form.subject_name.trim()) return setError('Subject name is required');
    if (!form.program_id) return setError('Program is required');
    if (form.credit === '' || isNaN(Number(form.credit))) return setError('Credit must be a number');
    setCreating(true);
    try {
      const created = await api.createSubject({
        subject_code: form.subject_code.trim(),
        subject_name: form.subject_name.trim(),
        program_id: form.program_id,
        credit: Number(form.credit)
      });
      setSubjects(prev => [created, ...prev]);
      setForm({ subject_code: '', subject_name: '', program_id: '', credit: '' });
      setShowModal(false);
      showSuccess('Subject created successfully!');
    } catch (e) { setError(e.message); } finally { setCreating(false); }
  };

  const handleUpdate = async () => {
    setError('');
    if (!form.subject_code.trim()) return setError('Subject code required');
    if (!form.subject_name.trim()) return setError('Subject name required');
    if (!form.program_id) return setError('Program required');
    if (form.credit === '' || isNaN(Number(form.credit))) return setError('Credit must be a number');
    setCreating(true);
    try {
      const updated = await api.updateSubject(editId, {
        subject_code: form.subject_code.trim(),
        subject_name: form.subject_name.trim(),
        program_id: form.program_id,
        credit: Number(form.credit)
      });
      setSubjects(prev => prev.map(s => s.id === editId ? updated : s));
      setEditId(null);
      setShowModal(false);
      showSuccess('Subject updated successfully!');
    } catch (e) { setError(e.message); } finally { setCreating(false); }
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setForm({ subject_code: m.subject_code, subject_name: m.subject_name, program_id: m.program_id, credit: m.credit });
    setShowModal(true);
    setError('');
  };

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      showSuccess('Subject deleted successfully!');
    } catch (e) { setError(e.message); }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              marginBottom: '8px',
              fontSize: '1.875rem',
              fontWeight: '700',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📖 Subjects Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage subjects within academic programs.</p>
          </div>
          <button
            onClick={openAddModal}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            ➕ Add Subject
          </button>
        </div>

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
            <span style={{ fontSize: '1.1rem' }}>📚</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Subjects List</h3>
            <span style={{ 
              marginLeft: 'auto', 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '0.875rem' 
            }}>
              {subjects.length} subjects
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
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
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
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '60px' }}>No</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Program</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Credit</th>
                <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' }}>Loading...</td></tr>
              ) : (() => {
                const startIndex = (currentPage - 1) * entriesPerPage;
                const endIndex = startIndex + entriesPerPage;
                const paginatedSubjects = subjects.slice(startIndex, endIndex);
                
                return paginatedSubjects.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' }}>No subjects found.</td></tr>
                ) : (
                  paginatedSubjects.map((s, index) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{startIndex + index + 1}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{s.id}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>{s.subject_code}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937' }}>{s.subject_name}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: '#4b5563' }}>
                        {s.program_name || '-'} {s.program_code ? '(' + s.program_code + ')' : ''}
                      </td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{s.credit}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button 
                            onClick={() => startEdit(s)} 
                            style={{ 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                              color: '#fff', 
                              border: 'none', 
                              padding: '8px 16px', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseEnter={e => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={e => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => deleteSubject(s.id)} 
                            style={{ 
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                              color: '#fff', 
                              border: 'none', 
                              padding: '8px 16px', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                            }}
                            onMouseEnter={e => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={e => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                  </tr>
                  ))
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: 6, marginBottom: 16 }}>
                    {error}
                  </div>
                )}
                <div className="form-field">
                  <label className="form-label">Subject Code <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="subject_code"
                    value={form.subject_code}
                    onChange={handleChange}
                    placeholder="Enter subject code"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Subject Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="subject_name"
                    value={form.subject_name}
                    onChange={handleChange}
                    placeholder="Enter subject name"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Program <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="program_id"
                    value={form.program_id}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Credit <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="credit"
                    value={form.credit}
                    onChange={handleChange}
                    placeholder="e.g., 60"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-submit" disabled={creating}>
                  {creating ? 'Saving...' : (editId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
