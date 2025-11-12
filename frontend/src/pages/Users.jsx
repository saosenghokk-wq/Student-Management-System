import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import '../styles/table.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', status: '1', role_id: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', email: '', password: '', role_id: '1', status: '1' });
  const [roles, setRoles] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [usersData, rolesData] = await Promise.all([
          api.getUsers(),
          api.getRoles()
        ]);
        if (mounted) {
          setUsers(usersData);
          setRoles(rolesData || []);
          if (rolesData && rolesData.length && !showAdd) {
            setAddForm(prev => ({ ...prev, role_id: String(rolesData[0].id) }));
          }
        }
      } catch (e) {
        if (mounted) setError(e.message);
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
      status: String(user.status ?? '1'),
      role_id: String(user.role_id ?? (roles[0]?.id ?? ''))
    });
    setSuccess('');
    setError('');
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
      setError(e.message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB');
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
      setError('Select image first');
      return;
    }
    setImageUploading(true);
    setError('');
    try {
      await api.updateUser(viewUser.id, { Image: imagePreview });
      // patch local list
      setUsers(prev => prev.map(u => u.id === viewUser.id ? { ...u, Image: imagePreview } : u));
      setSuccess('✓ Image updated');
      // refresh viewUser
      const fresh = await api.getUser(viewUser.id);
      setViewUser(fresh);
    } catch (e) {
      setError(e.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        username: form.username,
        email: form.email,
        status: form.status, // string '1' | '0'
        role_id: form.role_id
      };
      await api.updateUser(editUser.id, payload);
      // update local list
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...payload } : u));
      setSuccess('✓ User updated');
      setEditUser(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <h1>Users</h1>
          <div className="page-actions">
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="search-input"
            />
            <button className="btn" onClick={() => { setAddForm({ username:'', email:'', password:'', role_id:'1', status:'1' }); setShowAdd(true); }}>+ Add User</button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width: '80px'}}>ID</th>
                    <th>Username</th>
                    <th>Gmail</th>
                    <th>Role</th>
                    <th>Image</th>
                    <th style={{width: '140px'}}>Status</th>
                    <th style={{width: '160px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username || '-'}</td>
                      <td>{u.email || '-'}</td>
                      <td>{(roles.find(r => String(r.id) === String(u.role_id))?.name) || '-'}</td>
                      <td>
                        {u.Image ? (
                          <img src={u.Image} alt={u.username} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'1px solid #e2e8f0'}} />
                        ) : (
                          <div style={{width:32,height:32,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',color:'#64748b'}}>--</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${String(u.status) === '1' ? 'success' : 'danger'}`}>
                          {String(u.status) === '1' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{display:'flex',gap:'6px'}}>
                        <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                        <button className="btn btn-sm" onClick={() => openProfileDetail(u)}>Profile Detail</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
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
                setError('');
                setSuccess('');
                try {
                  // Build payload with only known columns
                  const payload = {
                    username: addForm.username,
                    email: addForm.email,
                    password: addForm.password,
                    role_id: parseInt(addForm.role_id, 10),
                    status: addForm.status
                  };
                  const created = await api.createUser(payload);
                  setUsers(prev => [{...created, password: undefined}, ...prev]);
                  setSuccess('✓ User created');
                  setShowAdd(false);
                } catch (e) {
                  setError(e.message);
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
      </div>
    </DashboardLayout>
  );
}
