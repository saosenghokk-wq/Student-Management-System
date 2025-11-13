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

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ subject_code: '', subject_name: '', program_id: '', credit: '' });

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

  const handleCreate = async (e) => {
    e.preventDefault();
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
      showSuccess('Subject created successfully!');
    } catch (e) { setError(e.message); } finally { setCreating(false); }
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setEditForm({ subject_code: m.subject_code, subject_name: m.subject_name, program_id: m.program_id, credit: m.credit });
    setError('');
  };
  const cancelEdit = () => setEditId(null);

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.subject_code.trim()) return setError('Subject code required');
    if (!editForm.subject_name.trim()) return setError('Subject name required');
    if (!editForm.program_id) return setError('Program required');
    if (editForm.credit === '' || isNaN(Number(editForm.credit))) return setError('Credit must be a number');
    try {
      const updated = await api.updateSubject(editId, {
        subject_code: editForm.subject_code.trim(),
        subject_name: editForm.subject_name.trim(),
        program_id: editForm.program_id,
        credit: Number(editForm.credit)
      });
      setSubjects(prev => prev.map(s => s.id === editId ? updated : s));
      cancelEdit();
      showSuccess('Subject updated successfully!');
    } catch (e) { setError(e.message); }
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
        <h1 style={{ marginBottom: '12px' }}>Subjects</h1>
        <p style={{ color: '#555', marginBottom: '24px' }}>Manage subjects within programs.</p>

        <form onSubmit={handleCreate} style={{ marginBottom: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Subject Code</label>
            <input name="subject_code" value={form.subject_code} onChange={handleChange} placeholder="Code" style={{ padding: '8px 12px', minWidth: 140, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Subject Name</label>
            <input name="subject_name" value={form.subject_name} onChange={handleChange} placeholder="Name" style={{ padding: '8px 12px', minWidth: 220, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Program</label>
            <select name="program_id" value={form.program_id} onChange={handleChange} style={{ padding: '8px 12px', minWidth: 220, border: '1px solid #ccc', borderRadius: 6 }}>
              <option value="">Select...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Credit</label>
            <input name="credit" value={form.credit} onChange={handleChange} placeholder="e.g. 60" style={{ padding: '8px 12px', minWidth: 100, border: '1px solid #ccc', borderRadius: 6 }} />
          </div>
          <button type="submit" disabled={creating} style={{ background: '#4f46e5', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {creating ? 'Creating...' : 'Add Subject'}
          </button>
        </form>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>ID</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Code</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Program</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Credit</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 16 }}>Loading...</td></tr>
              ) : subjects.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 16 }}>No subjects found.</td></tr>
              ) : (
                subjects.map(s => (
                  <tr key={s.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>{s.id}</td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === s.id ? (
                        <input value={editForm.subject_code} onChange={e => setEditForm(f => ({ ...f, subject_code: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
                      ) : s.subject_code}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === s.id ? (
                        <input value={editForm.subject_name} onChange={e => setEditForm(f => ({ ...f, subject_name: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
                      ) : s.subject_name}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === s.id ? (
                        <select value={editForm.program_id} onChange={e => setEditForm(f => ({ ...f, program_id: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}>
                          <option value="">Select...</option>
                          {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                        </select>
                      ) : (
                        `${s.program_name || '-'} ${s.program_code ? '(' + s.program_code + ')' : ''}`
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === s.id ? (
                        <input value={editForm.credit} onChange={e => setEditForm(f => ({ ...f, credit: e.target.value }))} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
                      ) : s.credit}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14, display: 'flex', gap: 8 }}>
                      {editId === s.id ? (
                        <>
                          <button onClick={saveEdit} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Save</button>
                          <button onClick={cancelEdit} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(s)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteSubject(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
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
