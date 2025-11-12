import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError(''); setSuccess('');
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
      setSuccess('Program created');
      setTimeout(() => setSuccess(''), 2000);
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
    setError(''); setSuccess('');
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
      setSuccess('Program updated');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) { setError(e.message); }
  };

  const deleteProgram = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await api.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      setSuccess('Program deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) { setError(e.message); }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '12px' }}>Programs</h1>
        <p style={{ color: '#555', marginBottom: '24px' }}>Manage academic programs.</p>
        <form onSubmit={handleCreate} style={{ marginBottom: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Program name" style={{ padding: '8px 12px', minWidth: 180, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Code</label>
            <input name="code" value={form.code} onChange={handleChange} placeholder="Code" style={{ padding: '8px 12px', minWidth: 120, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Department</label>
            <select name="department_id" value={form.department_id} onChange={handleChange} style={{ padding: '8px 12px', minWidth: 180, border: '1px solid #ccc', borderRadius: 6 }}>
              <option value="">Select...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Degree</label>
            <select name="degree_id" value={form.degree_id} onChange={handleChange} style={{ padding: '8px 12px', minWidth: 160, border: '1px solid #ccc', borderRadius: 6 }}>
              <option value="">Select...</option>
              {degrees.map(d => <option key={d.id} value={d.id}>{d.degree}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} style={{ padding: '8px 12px', minWidth: 140, border: '1px solid #ccc', borderRadius: 6 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 250 }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Description</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ padding: '8px 12px', width: '100%', border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <button type="submit" disabled={creating} style={{ background: '#4f46e5', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {creating ? 'Creating...' : 'Add Program'}
          </button>
          {error && <div style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ color: '#047857', fontWeight: 600 }}>{success}</div>}
        </form>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>ID</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Code</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Department</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Degree</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 16 }}>Loading...</td></tr>
              ) : programs.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 16 }}>No programs found.</td></tr>
              ) : (
                programs.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>{p.id}</td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === p.id ? (
                        <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
                      ) : p.name}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === p.id ? (
                        <input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
                      ) : p.code}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === p.id ? (
                        <select value={editForm.department_id} onChange={e => setEditForm(f => ({ ...f, department_id: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}>
                          <option value="">Select...</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                        </select>
                      ) : p.department_name || '-'}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === p.id ? (
                        <select value={editForm.degree_id} onChange={e => setEditForm(f => ({ ...f, degree_id: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}>
                          <option value="">Select...</option>
                          {degrees.map(d => <option key={d.id} value={d.id}>{d.degree}</option>)}
                        </select>
                      ) : p.degree_name || '-'}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === p.id ? (
                        <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span style={{ padding: '4px 8px', borderRadius: 12, background: p.status === 'active' ? '#d1fae5' : '#fee2e2', color: p.status === 'active' ? '#065f46' : '#991b1b' }}>{p.status}</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14, display: 'flex', gap: 8 }}>
                      {editId === p.id ? (
                        <>
                          <button onClick={saveEdit} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Save</button>
                          <button onClick={cancelEdit} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteProgram(p.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
