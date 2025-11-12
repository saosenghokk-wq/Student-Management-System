import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/table.css';

export default function Parents() {
  // State declarations
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState('');

  // Location cascade state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    parent_code: '',
    mother_name: '',
    mother_occupation: '',
    mother_phone: '',
    mother_status: 'alive',
    father_name: '',
    father_occupation: '',
    father_phone: '',
    father_status: 'alive',
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: ''
  });

  // Load parents
  const loadParents = async () => {
    try {
      const data = await api.getParents();
      setParents(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  // Location loaders
  const loadProvinces = async () => {
    try {
      const data = await api.getProvinces();
      setProvinces(data || []);
    } catch (e) { /* ignore */ }
  };
  const onProvinceChange = async (no) => {
    setForm(prev => ({ ...prev, province_no: no, district_no: '', commune_no: '', village_no: '' }));
    setDistricts([]); setCommunes([]); setVillages([]);
    if (!no) return;
    const data = await api.getDistricts(no);
    setDistricts(data || []);
  };
  const onDistrictChange = async (no) => {
    setForm(prev => ({ ...prev, district_no: no, commune_no: '', village_no: '' }));
    setCommunes([]); setVillages([]);
    if (!no) return;
    const data = await api.getCommunes(no);
    setCommunes(data || []);
  };
  const onCommuneChange = async (no) => {
    setForm(prev => ({ ...prev, commune_no: no, village_no: '' }));
    setVillages([]);
    if (!no) return;
    const data = await api.getVillages(no);
    setVillages(data || []);
  };

  useEffect(() => { loadParents(); loadProvinces(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      username: '', email: '', password: '', parent_code: '',
      mother_name: '', mother_occupation: '', mother_phone: '', mother_status: 'alive',
      father_name: '', father_occupation: '', father_phone: '', father_status: 'alive',
      province_no: '', district_no: '', commune_no: '', village_no: ''
    });
    setDistricts([]); setCommunes([]); setVillages([]);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); resetForm(); };

  const startEdit = (parent) => {
    setEditId(parent.id);
    setForm({
      parent_code: parent.parent_code || '',
      mother_name: parent.mother_name || '',
      mother_occupation: parent.mother_occupation || '',
      mother_phone: parent.mother_phone || '',
      mother_status: parent.mother_status || 'alive',
      father_name: parent.father_name || '',
      father_occupation: parent.father_occupation || '',
      father_phone: parent.father_phone || '',
      father_status: parent.father_status || 'alive',
      province_no: parent.province_no || '',
      district_no: parent.district_no || '',
      commune_no: parent.commune_no || '',
      village_no: parent.village_no || '',
      // account fields are not editable when editing
      username: '', email: '', password: ''
    });
    setShowModal(true);
    loadProvinces().then(() => {
      if (parent.province_no) {
        onProvinceChange(parent.province_no).then(() => {
          if (parent.district_no) {
            onDistrictChange(parent.district_no).then(() => {
              if (parent.commune_no) { onCommuneChange(parent.commune_no); }
            });
          }
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editId) {
        await api.updateParent(editId, form);
        setSuccess('Parent updated successfully');
      } else {
        await api.createParent(form);
        setSuccess('Parent created successfully');
      }
      closeModal();
      loadParents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
      setTimeout(() => setError(''), 4000);
    }
  };

  const deleteParent = async (id) => {
    if (!window.confirm('Delete this parent?')) return;
    try {
      await api.deleteParent(id);
      setParents(prev => prev.filter(p => p.id !== id));
      setSuccess('Parent deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message || 'Delete failed'); }
  };

  // Filtered list
  const filtered = useMemo(() => {
    if (!query) return parents;
    const q = query.toLowerCase();
    return parents.filter(p =>
      String(p.id).includes(q) ||
      (p.parent_code || '').toLowerCase().includes(q) ||
      (p.mother_name || '').toLowerCase().includes(q) ||
      (p.father_name || '').toLowerCase().includes(q)
    );
  }, [parents, query]);

  if (loading) return <DashboardLayout><div>Loading parents...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Parents</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>Manage parent records</p>
          </div>
          <div className="page-actions">
            <input
              className="search-input"
              placeholder="Search parents..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="btn" onClick={() => { setShowModal(true); loadProvinces(); }}>
              + Add Parent
            </button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{maxWidth:720, maxHeight:'90vh', overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Parent' : 'Add New Parent'}</h3>
              <button className="close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {!editId && (
                  <>
                    <div style={{marginBottom:16,paddingBottom:16,borderBottom:'1px solid #f1f5f9'}}>
                      <h4 style={{margin:'0 0 12px',fontSize:'.75rem',fontWeight:700,color:'#475569',letterSpacing:'.5px',textTransform:'uppercase'}}>👤 Account Information</h4>
                      <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
                        <div className="form-field">
                          <label>Username <span style={{color:'#ef4444'}}>*</span></label>
                          <input name="username" value={form.username} onChange={handleChange} required placeholder="Enter username" />
                        </div>
                        <div className="form-field">
                          <label>Email <span style={{color:'#ef4444'}}>*</span></label>
                          <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="name@example.com" />
                        </div>
                        <div className="form-field" style={{gridColumn:'1 / -1'}}>
                          <label>Password <span style={{color:'#ef4444'}}>*</span></label>
                          <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Enter password" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div style={{marginBottom:16}}>
                  <h4 style={{margin:'0 0 12px',fontSize:'.75rem',fontWeight:700,color:'#475569',letterSpacing:'.5px',textTransform:'uppercase'}}>🪪 Parent Code</h4>
                  <div className="form-field">
                    <label>Parent Code <span style={{color:'#ef4444'}}>*</span></label>
                    <input name="parent_code" value={form.parent_code} onChange={handleChange} required placeholder="e.g., P-0001" />
                  </div>
                </div>

                <div style={{marginBottom:16,paddingBottom:16,borderBottom:'1px solid #f1f5f9'}}>
                  <h4 style={{margin:'0 0 12px',fontSize:'.75rem',fontWeight:700,color:'#475569',letterSpacing:'.5px',textTransform:'uppercase'}}>👩 Mother Information</h4>
                  <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div className="form-field">
                      <label>Mother Name <span style={{color:'#ef4444'}}>*</span></label>
                      <input name="mother_name" value={form.mother_name} onChange={handleChange} required placeholder="Full name" />
                    </div>
                    <div className="form-field">
                      <label>Occupation</label>
                      <input name="mother_occupation" value={form.mother_occupation} onChange={handleChange} placeholder="Occupation" />
                    </div>
                    <div className="form-field">
                      <label>Phone <span style={{color:'#ef4444'}}>*</span></label>
                      <input type="tel" name="mother_phone" value={form.mother_phone} onChange={handleChange} required placeholder="Phone number" />
                    </div>
                    <div className="form-field">
                      <label>Status <span style={{color:'#ef4444'}}>*</span></label>
                      <select name="mother_status" value={form.mother_status} onChange={handleChange} required>
                        <option value="alive">Alive</option>
                        <option value="deceased">Deceased</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{marginBottom:16,paddingBottom:16,borderBottom:'1px solid #f1f5f9'}}>
                  <h4 style={{margin:'0 0 12px',fontSize:'.75rem',fontWeight:700,color:'#475569',letterSpacing:'.5px',textTransform:'uppercase'}}>👨 Father Information</h4>
                  <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div className="form-field">
                      <label>Father Name <span style={{color:'#ef4444'}}>*</span></label>
                      <input name="father_name" value={form.father_name} onChange={handleChange} required placeholder="Full name" />
                    </div>
                    <div className="form-field">
                      <label>Occupation</label>
                      <input name="father_occupation" value={form.father_occupation} onChange={handleChange} placeholder="Occupation" />
                    </div>
                    <div className="form-field">
                      <label>Phone <span style={{color:'#ef4444'}}>*</span></label>
                      <input type="tel" name="father_phone" value={form.father_phone} onChange={handleChange} required placeholder="Phone number" />
                    </div>
                    <div className="form-field">
                      <label>Status <span style={{color:'#ef4444'}}>*</span></label>
                      <select name="father_status" value={form.father_status} onChange={handleChange} required>
                        <option value="alive">Alive</option>
                        <option value="deceased">Deceased</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{margin:'0 0 12px',fontSize:'.75rem',fontWeight:700,color:'#475569',letterSpacing:'.5px',textTransform:'uppercase'}}>📍 Address</h4>
                  <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div className="form-field">
                      <label>Province</label>
                      <select value={form.province_no} onChange={e => onProvinceChange(e.target.value)}>
                        <option value="">Select Province</option>
                        {provinces.map(p => <option key={p.province_no} value={p.province_no}>{p.province_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>District</label>
                      <select value={form.district_no} onChange={e => onDistrictChange(e.target.value)} disabled={!form.province_no}>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d.district_no} value={d.district_no}>{d.district_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Commune</label>
                      <select value={form.commune_no} onChange={e => onCommuneChange(e.target.value)} disabled={!form.district_no}>
                        <option value="">Select Commune</option>
                        {communes.map(c => <option key={c.commune_no} value={c.commune_no}>{c.commune_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Village</label>
                      <select value={form.village_no} onChange={e => setForm(prev => ({ ...prev, village_no: e.target.value }))} disabled={!form.commune_no}>
                        <option value="">Select Village</option>
                        {villages.map(v => <option key={v.village_no} value={v.village_no}>{v.village_name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-submit">{editId ? 'Update Parent' : 'Create Parent'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:'60px'}}>ID</th>
                  <th>Code</th>
                  <th>Mother Name</th>
                  <th>Mother Phone</th>
                  <th style={{width:'100px'}}>Mother</th>
                  <th>Father Name</th>
                  <th>Father Phone</th>
                  <th style={{width:'100px'}}>Father</th>
                  <th style={{width:'140px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 16, textAlign: 'center' }}>No parents found.</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td style={{fontWeight:600}}>{p.parent_code}</td>
                      <td>{p.mother_name}</td>
                      <td>{p.mother_phone}</td>
                      <td>
                        <span className={`badge ${p.mother_status==='alive'?'success':'danger'}`}>
                          {p.mother_status || '-'}
                        </span>
                      </td>
                      <td>{p.father_name}</td>
                      <td>{p.father_phone}</td>
                      <td>
                        <span className={`badge ${p.father_status==='alive'?'success':'danger'}`}>
                          {p.father_status || '-'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm" onClick={() => startEdit(p)}>Edit</button>
                        <button className="btn btn-sm btn-cancel" onClick={() => deleteParent(p.id)} style={{marginLeft:4}}>Delete</button>
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
