import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function Programs() {
  const { showSuccess, showError, showWarning } = useAlert();
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

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', description: '', code: '', department_id: '', degree_id: '', status: 'active'
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
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
      setForm({ name: '', description: '', code: '', department_id: '', degree_id: '', status: 'active' });
      showSuccess('Program created successfully!');
    } catch (e) { setError(e.message); } finally { setCreating(false); }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditForm({
      name: p.name,
      description: p.description,
      code: p.code,
      department_id: p.department_id,
      degree_id: p.degree_id,
      status: p.status
    });
    setError('');
  };
  const cancelEdit = () => { setEditId(null); };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return setError('Name required');
    if (!editForm.code.trim()) return setError('Code required');
    if (!editForm.department_id) return setError('Department required');
    if (!editForm.degree_id) return setError('Degree required');
    try {
      const updated = await api.updateProgram(editId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        code: editForm.code.trim(),
        department_id: editForm.department_id,
        degree_id: editForm.degree_id,
        status: editForm.status
      });
      setPrograms(prev => prev.map(p => p.id === editId ? updated : p));
      cancelEdit();
      showSuccess('Program updated successfully!');
    } catch (e) { setError(e.message); }
  };

  const deleteProgram = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await api.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      showSuccess('Program deleted successfully!');
    } catch (e) { setError(e.message); }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
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

        {/* Create Form */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ➕ Add New Program
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '0.875rem' }}>
                Program Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter program name" 
                style={{ 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }} 
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '0.875rem' }}>
                Program Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                name="code" 
                value={form.code} 
                onChange={handleChange} 
                placeholder="e.g., CS101" 
                style={{ 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }} 
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '0.875rem' }}>
                Department <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select 
                name="department_id" 
                value={form.department_id} 
                onChange={handleChange} 
                style={{ 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '0.875rem' }}>
                Degree <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select 
                name="degree_id" 
                value={form.degree_id} 
                onChange={handleChange} 
                style={{ 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Degree</option>
                {degrees.map(d => <option key={d.id} value={d.id}>{d.degree}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '0.875rem' }}>Status</label>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange} 
                style={{ 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '0.875rem' }}>Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                placeholder="Enter program description..." 
                rows={3}
                style={{ 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                type="submit" 
                disabled={creating} 
                style={{ 
                  background: creating ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                  color: '#fff', 
                  padding: '12px 24px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: creating ? 'not-allowed' : 'pointer', 
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={e => !creating && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => !creating && (e.target.style.transform = 'translateY(0)')}
              >
                {creating ? '⏳ Creating...' : '✅ Add Program'}
              </button>
              {error && <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>❌ {error}</div>}
            </div>
          </form>
        </div>

        {/* Programs Table */}
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
            <span style={{ fontSize: '1.1rem' }}>📋</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Programs List</h3>
            <span style={{ 
              marginLeft: 'auto', 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '0.875rem' 
            }}>
              {programs.length} programs
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Degree</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ 
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
                  <td colSpan={8} style={{ 
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
              ) : (
                programs.map((p, index) => (
                  <tr 
                    key={p.id} 
                    style={{ 
                      borderBottom: index < programs.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ 
                      padding: '16px 20px', 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280'
                    }}>
                      #{p.id}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      {editId === p.id ? (
                        <input 
                          value={editForm.name} 
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} 
                          style={{ 
                            padding: '8px 12px', 
                            border: '2px solid #3b82f6', 
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            width: '100%',
                            outline: 'none'
                          }} 
                        />
                      ) : (
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{p.name}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      {editId === p.id ? (
                        <input 
                          value={editForm.code} 
                          onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} 
                          style={{ 
                            padding: '8px 12px', 
                            border: '2px solid #3b82f6', 
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            width: '100%',
                            outline: 'none'
                          }} 
                        />
                      ) : (
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
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', maxWidth: '200px' }}>
                      {editId === p.id ? (
                        <textarea 
                          value={editForm.description} 
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} 
                          style={{ 
                            padding: '8px 12px', 
                            border: '2px solid #3b82f6', 
                            borderRadius: '6px', 
                            resize: 'vertical', 
                            minHeight: '60px', 
                            width: '100%',
                            fontSize: '0.875rem',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }} 
                        />
                      ) : (
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
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      {editId === p.id ? (
                        <select 
                          value={editForm.department_id} 
                          onChange={e => setEditForm(f => ({ ...f, department_id: e.target.value }))} 
                          style={{ 
                            padding: '8px 12px', 
                            border: '2px solid #3b82f6', 
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            width: '100%',
                            outline: 'none'
                          }}
                        >
                          <option value="">Select...</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: '#4b5563', fontWeight: '500' }}>{p.department_name || '-'}</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      {editId === p.id ? (
                        <select 
                          value={editForm.degree_id} 
                          onChange={e => setEditForm(f => ({ ...f, degree_id: e.target.value }))} 
                          style={{ 
                            padding: '8px 12px', 
                            border: '2px solid #3b82f6', 
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            width: '100%',
                            outline: 'none'
                          }}
                        >
                          <option value="">Select...</option>
                          {degrees.map(d => <option key={d.id} value={d.id}>{d.degree}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: '#4b5563', fontWeight: '500' }}>{p.degree_name || '-'}</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      {editId === p.id ? (
                        <select 
                          value={editForm.status} 
                          onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} 
                          style={{ 
                            padding: '8px 12px', 
                            border: '2px solid #3b82f6', 
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            width: '100%',
                            outline: 'none'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
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
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {editId === p.id ? (
                          <>
                            <button 
                              onClick={saveEdit} 
                              style={{ 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
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
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                            >
                              ✅ Save
                            </button>
                            <button 
                              onClick={cancelEdit} 
                              style={{ 
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
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
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                            >
                              ❌ Cancel
                            </button>
                          </>
                        ) : (
                          <>
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
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
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
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
