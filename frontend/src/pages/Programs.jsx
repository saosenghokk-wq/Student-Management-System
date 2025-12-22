import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function Programs() {
  const { showSuccess } = useAlert();
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    code: '',
    department_id: '',
    degree_id: '',
    status: 'active'
  });
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [progData, deptData, degreeData] = await Promise.all([
        api.getPrograms(),
        api.getDepartments(),
        api.getDegrees()
      ]);
      setPrograms(progData);
      setDepartments(deptData);
      setDegrees(degreeData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: '', description: '', code: '', department_id: '', degree_id: '', status: 'active' });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
    if (!form.name.trim()) return setError('Name is required');
    if (!form.code.trim()) return setError('Code is required');
    if (!form.department_id) return setError('Department is required');
    if (!form.degree_id) return setError('Degree is required');
    setCreating(true);
    try {
      const created = await api.createProgram({
        name: form.name.trim(),
        description: form.description.trim(),
        code: form.code.trim(),
        department_id: form.department_id,
        degree_id: form.degree_id,
        status: form.status
      });
      setPrograms(prev => [created, ...prev]);
      setShowModal(false);
      showSuccess('Program created successfully!');
    } catch (e) { setError(e.message); } finally { setCreating(false); }
  };

  const handleUpdate = async () => {
    setError('');
    if (!form.name.trim()) return setError('Name required');
    if (!form.code.trim()) return setError('Code required');
    if (!form.department_id) return setError('Department required');
    if (!form.degree_id) return setError('Degree required');
    setCreating(true);
    try {
      const updated = await api.updateProgram(editId, {
        name: form.name.trim(),
        description: form.description.trim(),
        code: form.code.trim(),
        department_id: form.department_id,
        degree_id: form.degree_id,
        status: form.status
      });
      setPrograms(prev => prev.map(p => p.id === editId ? updated : p));
      setShowModal(false);
      showSuccess('Program updated successfully!');
    } catch (e) { setError(e.message); } finally { setCreating(false); }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      code: p.code,
      department_id: p.department_id,
      degree_id: p.degree_id,
      status: p.status
    });
    setError('');
    setShowModal(true);
  };

  const deleteProgram = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await api.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      showSuccess('Program deleted successfully!');
    } catch (e) { setError(e.message); }
  };

  // Filter programs based on search term and department
  const filteredPrograms = programs.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      p.name?.toLowerCase().includes(searchLower) ||
      p.code?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.department_name?.toLowerCase().includes(searchLower) ||
      p.degree_name?.toLowerCase().includes(searchLower)
    );
    const matchesDepartment = !selectedDepartment || p.department_id?.toString() === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              marginBottom: '8px', 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📚 Programs Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage academic programs and their details.</p>
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
            ➕ Add Program
          </button>
        </div>

        {/* Programs Table */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Search Bar and Department Filter */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            padding: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📚</span> Programs List
              </h3>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
                {filteredPrograms.length} programs
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem'
                }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
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
              {/* Department Filter */}
              <div style={{ minWidth: '250px' }}>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '0.95rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    background: 'white'
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
                  <option value="">🏢 All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
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
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '60px' }}>No</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Degree</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                </tr>
              </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ 
                    padding: '48px 20px', 
                    textAlign: 'center', 
                    color: '#6b7280',
                    fontSize: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '2px solid #e5e7eb', 
                        borderTop: '2px solid #3b82f6', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }}></div>
                      Loading programs...
                    </div>
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ 
                    padding: '48px 20px', 
                    textAlign: 'center', 
                    color: '#6b7280',
                    fontSize: '1rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '2rem' }}>📚</span>
                      No programs found. Create your first program above!
                    </div>
                  </td>
                </tr>
              ) : (() => {
                const startIndex = (currentPage - 1) * entriesPerPage;
                const endIndex = startIndex + entriesPerPage;
                const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);
                
                if (paginatedPrograms.length === 0 && searchTerm) {
                  return (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                        No programs match your search.
                      </td>
                    </tr>
                  );
                }
                
                return paginatedPrograms.map((p, index) => (
                  <tr 
                    key={p.id} 
                    style={{ 
                      borderBottom: index < paginatedPrograms.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ 
                      padding: '16px 20px', 
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.95rem' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{p.name}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <span style={{ 
                        background: '#dbeafe', 
                        color: '#1e40af', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600' 
                      }}>
                        {p.code}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', maxWidth: '200px' }}>
                      <div style={{ 
                        color: '#4b5563', 
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {p.description || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No description</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <span style={{ color: '#4b5563', fontWeight: '500' }}>{p.department_name || '-'}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <span style={{ color: '#4b5563', fontWeight: '500' }}>{p.degree_name || '-'}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        background: p.status === 'active' 
                          ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
                        color: p.status === 'active' ? '#065f46' : '#991b1b',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => startEdit(p)} 
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
                          onClick={() => deleteProgram(p.id)} 
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
                ));
              })()}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Program' : 'Add New Program'}</h2>
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
                  <label className="form-label">Program Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter program name"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Program Code <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g., CS101"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Department <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Degree <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="degree_id"
                    value={form.degree_id}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Degree</option>
                    {degrees.map(d => <option key={d.id} value={d.id}>{d.degree}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter program description..."
                    className="form-input"
                    rows={3}
                    style={{ resize: 'vertical' }}
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
