import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

export default function Parents() {
  const { showSuccess, showError, showWarning } = useAlert();
  // State declarations
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

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
    setError('');
    try {
      if (editId) {
        await api.updateParent(editId, form);
        showSuccess('Parent updated successfully');
      } else {
        const newParent = await api.createParent(form);
        setParents(prev => [newParent, ...prev]);
        showSuccess('Parent created successfully');
      }
      closeModal();
      if (editId) loadParents();
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
      showSuccess('Parent deleted successfully');
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
              👨‍👩‍👧‍👦 Parents Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage parent and guardian records</p>
          </div>
          <button
            onClick={() => window.location.href = '/parents/add'}
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
            ➕ Add Parent
          </button>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="page-actions">
            <input
              className="search-input"
              placeholder="Search parents..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

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
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Parents List</h3>
            <span style={{ 
              marginLeft: 'auto', 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '0.875rem' 
            }}>
              {parents.length} parents
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
          
          <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '50px' }}>No</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '60px' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Mother Name</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Mother Phone</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Mother</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Father Name</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Father Phone</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Father</th>
                    <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                  </tr>
              </thead>
              <tbody>
                {(() => {
                  const startIndex = (currentPage - 1) * entriesPerPage;
                  const endIndex = startIndex + entriesPerPage;
                  const paginatedParents = filtered.slice(startIndex, endIndex);
                  
                  return paginatedParents.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '0.875rem' }}>
                        No parents found.
                      </td>
                    </tr>
                  ) : (
                    paginatedParents.map((p, index) => (
                      <tr 
                        key={p.id}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                            {startIndex + index + 1}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {p.id}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                            {p.parent_code}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {p.mother_name}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {p.mother_phone}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span className={`badge ${p.mother_status==='alive'?'success':'danger'}`}>
                              {p.mother_status || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {p.father_name}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {p.father_phone}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span className={`badge ${p.father_status==='alive'?'success':'danger'}`}>
                              {p.father_status || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <button
                              onClick={() => startEdit(p)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                                transition: 'all 0.2s',
                                marginRight: '8px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteParent(p.id)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                border: 'none',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          </div>
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
    </DashboardLayout>
  );
}
