import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staff, setStaff] = useState([]);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStaffId, setEditStaffId] = useState('');

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!departmentName.trim()) {
      setError('Department name is required');
      return;
    }
    if (!staffId) {
      setError('Please select head staff');
      return;
    }
    setCreating(true);
    try {
      console.log('Creating department:', { department_name: departmentName.trim(), staff_id: staffId });
      const newDept = await api.createDepartment({ department_name: departmentName.trim(), staff_id: staffId });
      console.log('Department created:', newDept);
      setDepartments(prev => [newDept, ...prev]);
      setDepartmentName('');
      setStaffId('');
      setSuccess('Department created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('Error creating department:', e);
      setError(e.message || 'Failed to create department');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (dept) => {
    setEditId(dept.id);
    setEditName(dept.department_name);
    setEditStaffId(dept.staff_id || '');
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditStaffId('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editName.trim()) {
      setError('Department name is required');
      return;
    }
    if (!editStaffId) {
      setError('Please select head staff');
      return;
    }
    try {
      console.log('Updating department:', editId, { department_name: editName.trim(), staff_id: editStaffId });
      const updated = await api.updateDepartment(editId, {
        department_name: editName.trim(),
        staff_id: editStaffId
      });
      console.log('Department updated:', updated);
      setDepartments(prev => prev.map(d => d.id === editId ? updated : d));
      cancelEdit();
      setSuccess('Department updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('Error updating department:', e);
      setError(e.message || 'Failed to update department');
    }
  };

  const deleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    setError('');
    try {
      await api.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      setSuccess('Department deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '12px' }}>Departments</h1>
        <p style={{ color: '#555', marginBottom: '24px' }}>Manage academic departments.</p>

        <form onSubmit={handleCreate} style={{ marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Department Name</label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Enter department name"
              style={{ padding: '8px 12px', minWidth: '220px', border: '1px solid #ccc', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Head Staff <span style={{ color: '#ef4444' }}>*</span></label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ padding: '8px 12px', minWidth: '220px', border: '1px solid #ccc', borderRadius: 6 }}
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
          <button
            type="submit"
            disabled={creating}
            style={{ background: '#4f46e5', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: creating ? 0.6 : 1 }}
          >
            {creating ? 'Creating...' : 'Add Department'}
          </button>
        </form>
        
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
        {success && (
          <div style={{ 
            background: '#d1fae5', 
            border: '1px solid #6ee7b7', 
            color: '#047857', 
            padding: '12px 16px', 
            borderRadius: 6, 
            marginBottom: 16,
            fontWeight: 600 
          }}>
            ✅ {success}
          </div>
        )}

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>ID</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Department Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Head Staff (EN)</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Head Staff (KH)</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 16 }}>Loading...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 16 }}>No departments found.</td></tr>
              ) : (
                departments.map(d => (
                  <tr key={d.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>{d.id}</td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === d.id ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
                      ) : (
                        d.department_name
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>
                      {editId === d.id ? (
                        <select value={editStaffId} onChange={(e) => setEditStaffId(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}>
                          <option value="">Select staff...</option>
                          {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.eng_name}</option>
                          ))}
                        </select>
                      ) : (
                        d.staff_eng_name || '-'
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 14 }}>{d.staff_khmer_name || '-'}</td>
                    <td style={{ padding: '8px 14px', fontSize: 14, display: 'flex', gap: 8 }}>
                      {editId === d.id ? (
                        <>
                          <button onClick={saveEdit} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Save</button>
                          <button onClick={cancelEdit} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(d)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteDept(d.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
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
