import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

export default function Users() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', status: '1', role_id: '' });
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', email: '', password: '', role_id: '1', status: '1', department_id: '' });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      // setError('');
      try {
        const [usersData, rolesData, departmentsData] = await Promise.all([
          api.getUsers(),
          api.getRoles(),
          api.getDepartments()
        ]);
        if (mounted) {
          setUsers(usersData);
          setRoles(rolesData || []);
          setDepartments(departmentsData || []);
          if (rolesData && rolesData.length) {
            setAddForm(prev => ({ ...prev, role_id: String(rolesData[0].id) }));
          }
        }
      } catch (e) {
        if (mounted) {
          setError(e.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(u =>
      String(u.id).includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      status: String(user.status ?? '1'),
      role_id: String(user.role_id ?? (roles[0]?.id ?? '')),
      department_id: user.department_id ? String(user.department_id) : ''
    });
  };

  const openProfileDetail = async (user) => {
    setViewUser(null);
    setViewLoading(true);
    setSelectedImageFile(null);
    setImagePreview(null);
    try {
      const fresh = await api.getUser(user.id);
      setViewUser(fresh);
      if (fresh.Image) setImagePreview(fresh.Image);
    } catch (e) {
      showError(e.message || 'Failed to load user details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showWarning('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showWarning('Image must be less than 5MB');
      return;
    }
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadUserImage = async () => {
    if (!viewUser || !selectedImageFile || !imagePreview) {
      showWarning('Please select an image first');
      return;
    }
    setImageUploading(true);
    try {
      await api.updateUser(viewUser.id, { Image: imagePreview });
      // patch local list
      setUsers(prev => prev.map(u => u.id === viewUser.id ? { ...u, Image: imagePreview } : u));
      showSuccess('User image updated successfully!');
      // refresh viewUser
      const fresh = await api.getUser(viewUser.id);
      setViewUser(fresh);
    } catch (e) {
      showError(e.message || 'Failed to update image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        status: form.status, // string '1' | '0'
        role_id: form.role_id,
        department_id: form.department_id ? parseInt(form.department_id, 10) : null
      };
      // Only include password if it's not empty
      if (form.password && form.password.trim()) {
        payload.password = form.password;
      }
      await api.updateUser(editUser.id, payload);
      // update local list
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...payload } : u));
      showSuccess('User updated successfully!');
      setEditUser(null);
    } catch (e) {
      showError(e.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      showSuccess('User deleted successfully!');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (e) {
      const errorMsg = e.message || 'Failed to delete user';
      if (errorMsg.includes('cannot') || errorMsg.includes("can't") || errorMsg.includes('not allowed')) {
        showError(`Cannot delete this user: ${errorMsg}`);
      } else {
        showError(errorMsg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
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
              👥 Users Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage system users and access control</p>
          </div>
          <button
            onClick={() => { setAddForm({ username:'', email:'', password:'', role_id:'1', status:'1', department_id: '' }); setShowAdd(true); }}
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
            ➕ Add User
          </button>
        </div>

        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
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
                  <span style={{ fontSize: '1.2rem' }}>👥</span> Users List
                </h3>
                <span style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
                  {filtered.length} users
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
                  placeholder="Search users..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
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
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Username</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Gmail</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Image</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Status</th>
                      <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const startIndex = (currentPage - 1) * entriesPerPage;
                      const endIndex = startIndex + entriesPerPage;
                      const paginatedUsers = filtered.slice(startIndex, endIndex);
                      
                      return paginatedUsers.map((u, index) => (
                      <tr key={u.id} style={{
                        borderBottom: index < paginatedUsers.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>{startIndex + index + 1}</td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{u.username || '-'}</td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>{u.email || '-'}</td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>{(roles.find(r => String(r.id) === String(u.role_id))?.name) || '-'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          {u.Image ? (
                            <img src={u.Image} alt={u.username} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'1px solid #e2e8f0'}} />
                          ) : (
                            <div style={{width:32,height:32,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',color:'#64748b'}}>--</div>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge ${String(u.status) === '1' ? 'success' : 'danger'}`}>
                            {String(u.status) === '1' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => openEdit(u)}
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
                            onClick={() => openProfileDetail(u)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginRight: '8px',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.4)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.4)';
                            }}
                          >
                            👤 Profile
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u)}
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
                    ));
                  })()}
                  {filtered.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '0.875rem' }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {filtered.length > 0 && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filtered.length)} to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff',
                      color: currentPage === 1 ? '#94a3b8' : '#475569',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 500
                    }}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff',
                      color: currentPage === 1 ? '#94a3b8' : '#475569',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Previous
                  </button>
                  <div style={{
                    padding: '6px 16px',
                    fontSize: '0.875rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    fontWeight: 600
                  }}>
                    {currentPage} / {Math.ceil(filtered.length / entriesPerPage)}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(filtered.length / entriesPerPage)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: currentPage >= Math.ceil(filtered.length / entriesPerPage) ? '#f1f5f9' : '#fff',
                      color: currentPage >= Math.ceil(filtered.length / entriesPerPage) ? '#94a3b8' : '#475569',
                      cursor: currentPage >= Math.ceil(filtered.length / entriesPerPage) ? 'not-allowed' : 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.ceil(filtered.length / entriesPerPage))}
                    disabled={currentPage >= Math.ceil(filtered.length / entriesPerPage)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: currentPage >= Math.ceil(filtered.length / entriesPerPage) ? '#f1f5f9' : '#fff',
                      color: currentPage >= Math.ceil(filtered.length / entriesPerPage) ? '#94a3b8' : '#475569',
                      cursor: currentPage >= Math.ceil(filtered.length / entriesPerPage) ? 'not-allowed' : 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add User</h3>
                <button className="close" onClick={() => setShowAdd(false)}>×</button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  // Build payload with only known columns
                  const payload = {
                    username: addForm.username,
                    email: addForm.email,
                    password: addForm.password,
                    role_id: parseInt(addForm.role_id, 10),
                    status: addForm.status,
                    department_id: addForm.department_id ? parseInt(addForm.department_id, 10) : null
                  };
                  const created = await api.createUser(payload);
                  setUsers(prev => [{...created, password: undefined}, ...prev]);
                  showSuccess('User created successfully!');
                  setShowAdd(false);
                } catch (e) {
                  showError(e.message || 'Failed to create user');
                } finally {
                  setSaving(false);
                }
              }}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Username</label>
                      <input value={addForm.username} onChange={e => setAddForm({...addForm, username: e.target.value})} required />
                    </div>
                    <div className="form-field">
                      <label>Email</label>
                      <input type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} required />
                    </div>
                    <div className="form-field">
                      <label>Password</label>
                      <input type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} required />
                    </div>
                    <div className="form-field">
                      <label>Role</label>
                      <select value={addForm.role_id} onChange={e => setAddForm({...addForm, role_id: e.target.value})}>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Status</label>
                      <select value={addForm.status} onChange={e => setAddForm({...addForm, status: e.target.value})}>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Department (Optional)</label>
                      <select value={addForm.department_id} onChange={e => setAddForm({...addForm, department_id: e.target.value})}>
                        <option value="">-- None --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.department_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-submit" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editUser && (
          <div className="modal-overlay" onClick={() => setEditUser(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit User #{editUser.id}</h3>
                <button className="close" onClick={() => setEditUser(null)}>×</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Username</label>
                      <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>Password <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>(Leave blank to keep current)</span></label>
                      <input 
                        type="password" 
                        value={form.password} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                        placeholder="Enter new password or leave blank"
                      />
                    </div>
                    <div className="form-field">
                      <label>Role</label>
                      <select value={form.role_id} onChange={e => setForm({ ...form, role_id: e.target.value })}>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Status</label>
                      <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Department (Optional)</label>
                      <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                        <option value="">-- None --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.department_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-cancel" onClick={() => setEditUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewUser && (
          <div className="modal-overlay" onClick={() => setViewUser(null)}>
            <div className="modal" style={{maxWidth:'600px'}} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>User Profile Detail #{viewUser.id}</h3>
                <button className="close" onClick={() => setViewUser(null)}>×</button>
              </div>
              <div className="modal-body">
                {viewLoading ? (
                  <div style={{padding:'20px'}}>Loading...</div>
                ) : (
                  <div style={{display:'flex',gap:'24px',flexWrap:'wrap'}}>
                    <div style={{flex:'0 0 160px',textAlign:'center'}}>
                      {imagePreview ? (
                        <img src={imagePreview} alt={viewUser.username} style={{width:140,height:140,borderRadius:'50%',objectFit:'cover',border:'2px solid #6366f1'}} />
                      ) : (
                        <div style={{width:140,height:140,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem',color:'#64748b'}}>👤</div>
                      )}
                      <div style={{marginTop:'12px'}}>
                        <input type="file" accept="image/*" id="user-image-input" style={{display:'none'}} onChange={handleImageSelect} />
                        <label htmlFor="user-image-input" className="btn btn-sm" style={{cursor:'pointer'}}>Choose Image</label>
                        {selectedImageFile && (
                          <button type="button" className="btn btn-sm" style={{marginLeft:'6px',background:'#ef4444'}} onClick={() => {setSelectedImageFile(null); setImagePreview(viewUser.Image || null);}}>Clear</button>
                        )}
                      </div>
                      <div style={{marginTop:'8px',fontSize:'.65rem',color:'#64748b'}}>Max 5MB, JPG/PNG/GIF</div>
                      <div style={{marginTop:'12px'}}>
                        <button type="button" disabled={imageUploading || !selectedImageFile} className="btn btn-submit btn-sm" onClick={uploadUserImage}>
                          {imageUploading ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                    <div style={{flex:'1 1 260px'}}>
                      <div style={{display:'grid',gap:'10px',fontSize:'.8rem'}}>
                        <div><strong>ID:</strong> {viewUser.id}</div>
                        <div><strong>Username:</strong> {viewUser.username || '-'}</div>
                        <div><strong>Email:</strong> {viewUser.email || '-'}</div>
                        <div><strong>Role:</strong> {(roles.find(r => String(r.id) === String(viewUser.role_id))?.name) || viewUser.role_id}</div>
                        <div><strong>Status:</strong> {String(viewUser.status) === '1' ? 'Active' : 'Inactive'}</div>
                        <div><strong>Has Image:</strong> {viewUser.Image ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={() => setViewUser(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="modal-overlay" onClick={handleDeleteCancel}>
            <div 
              className="modal" 
              style={{ maxWidth: '480px', textAlign: 'center' }} 
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}>
                {/* Warning Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  ⚠️
                </div>

                {/* Title */}
                <div>
                  <h2 style={{
                    margin: '0 0 8px',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#dc2626'
                  }}>
                    Delete User?
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: '#64748b',
                    lineHeight: '1.6'
                  }}>
                    Are you sure you want to delete this user?
                  </p>
                </div>

                {/* User Info Card */}
                <div style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '1.5rem'
                    }}>
                      👤
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '1.05rem',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        {userToDelete.username}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        {userToDelete.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                <div style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#991b1b',
                  lineHeight: '1.5'
                }}>
                  ⚠️ This action cannot be undone. All data associated with this user will be permanently deleted.
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  width: '100%',
                  marginTop: '8px'
                }}>
                  <button
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#fff',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#64748b',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isDeleting ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => !isDeleting && (e.target.style.background = '#f8fafc')}
                    onMouseLeave={(e) => !isDeleting && (e.target.style.background = '#fff')}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: isDeleting 
                        ? 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#fff',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                      opacity: isDeleting ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => !isDeleting && (e.target.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !isDeleting && (e.target.style.transform = 'translateY(0)')}
                  >
                    {isDeleting ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #fff',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}></span>
                        Deleting...
                      </span>
                    ) : (
                      '🗑️ Delete User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
