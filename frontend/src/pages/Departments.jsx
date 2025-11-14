import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function Departments() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staff, setStaff] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    department_name: '',
    staff_id: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [deptData, staffData] = await Promise.all([
        api.getDepartments(),
        api.getStaff()
      ]);
      setDepartments(deptData);
      setStaff(staffData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setForm({ department_name: '', staff_id: '' });
    setError('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.department_name.trim()) {
      setError('Department name is required');
      return;
    }
    if (!form.staff_id) {
      setError('Please select head staff');
      return;
    }
    setCreating(true);
    try {
      const newDept = await api.createDepartment({ department_name: form.department_name.trim(), staff_id: form.staff_id });
      setDepartments(prev => [newDept, ...prev]);
      setShowModal(false);
      showSuccess('Department created successfully!');
    } catch (e) {
      setError(e.message || 'Failed to create department');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (dept) => {
    setEditId(dept.id);
    setForm({
      department_name: dept.department_name,
      staff_id: dept.staff_id || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await handleUpdate();
    } else {
      await handleCreate(e);
    }
  };

  const handleUpdate = async () => {
    setError('');
    if (!form.department_name.trim()) {
      setError('Department name is required');
      return;
    }
    if (!form.staff_id) {
      setError('Please select head staff');
      return;
    }
    setCreating(true);
    try {
      const updated = await api.updateDepartment(editId, {
        department_name: form.department_name.trim(),
        staff_id: form.staff_id
      });
      setDepartments(prev => prev.map(d => d.id === editId ? updated : d));
      setShowModal(false);
      showSuccess('Department updated successfully!');
    } catch (e) {
      setError(e.message || 'Failed to update department');
    } finally {
      setCreating(false);
    }
  };

  const deleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    setError('');
    try {
      await api.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
      showSuccess('Department deleted successfully!');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
              🏢 Departments Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage academic departments and their heads.</p>
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
            ➕ Add Department
          </button>
        </div>
        
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #fca5a5', 
            color: '#b91c1c', 
            padding: '12px 16px', 
            borderRadius: 6, 
            marginBottom: 16,
            fontWeight: 600 
          }}>
            ❌ {error}
          </div>
        )}
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
            <span style={{ fontSize: '1.1rem' }}>🏛️</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Departments List</h3>
            <span style={{ 
              marginLeft: 'auto', 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '0.875rem' 
            }}>
              {departments.length} departments
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
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', width: '60px', borderBottom: '2px solid #5a67d8' }}>No</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Department Name</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Head Staff (EN)</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Head Staff (KH)</th>
                <th style={{ textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' }}>Loading...</td></tr>
              ) : (() => {
                const startIndex = (currentPage - 1) * entriesPerPage;
                const endIndex = startIndex + entriesPerPage;
                const paginatedDepartments = departments.slice(startIndex, endIndex);
                
                  return paginatedDepartments.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' }}>No departments found.</td></tr>
                ) : (
                  paginatedDepartments.map((d, index) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{startIndex + index + 1}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{d.id}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937' }}>{d.department_name}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: '#4b5563' }}>{d.staff_eng_name || '-'}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: '#4b5563' }}>{d.staff_khmer_name || '-'}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button 
                            onClick={() => startEdit(d)} 
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
                            onClick={() => deleteDept(d.id)} 
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

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editId ? 'Edit Department' : 'Add New Department'}</h3>
                <button className="close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: 6, marginBottom: 16 }}>
                      {error}
                    </div>
                  )}
                  <div className="form-field">
                    <label className="form-label">Department Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      value={form.department_name}
                      onChange={(e) => setForm({ ...form, department_name: e.target.value })}
                      placeholder="Enter department name"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Head Staff <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      value={form.staff_id}
                      onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="">Select staff...</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.eng_name} {s.khmer_name ? `(${s.khmer_name})` : ''}
                        </option>
                      ))}
                    </select>
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
      </div>
    </DashboardLayout>
  );
}