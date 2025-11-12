import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import '../styles/table.css';
import '../styles/modal.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    eng_name: '',
    khmer_name: '',
    phone: '',
    positions: '',
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([
        api.getAllStaff().catch(err => { console.error('Staff load error:', err); return []; }),
        api.getStaffPositions().catch(err => { console.error('Positions load error:', err); return []; }),
        api.getUsers().catch(err => { console.error('Users load error:', err); return []; }),
        api.getProvinces().catch(err => { console.error('Provinces load error:', err); return []; })
      ]);
      
      console.log('Staff loaded:', results[0]);
      console.log('Positions loaded:', results[1]);
      console.log('Users loaded:', results[2]);
      console.log('Provinces loaded:', results[3]);
      
      setStaff(results[0] || []);
      setPositions(results[1] || []);
      setUsers(results[2] || []);
      setProvinces(results[3] || []);
    } catch (err) {
      console.error('Error loading data:', err);
      alert('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({
      username: '',
      email: '',
      password: '',
      eng_name: '',
      khmer_name: '',
      phone: '',
      positions: '',
      province_no: '',
      district_no: '',
      commune_no: '',
      village_no: ''
    });
    setDistricts([]);
    setCommunes([]);
    setVillages([]);
    setShowModal(true);
  };

  const handleEdit = (staffMember) => {
    setEditingId(staffMember.Id);
    setForm({
      username: '',
      email: '',
      password: '',
      eng_name: staffMember.eng_name || '',
      khmer_name: staffMember.khmer_name || '',
      phone: staffMember.phone || '',
      positions: staffMember.positions || '',
      province_no: staffMember.province_no || '',
      district_no: staffMember.district_no || '',
      commune_no: staffMember.commune_no || '',
      village_no: staffMember.village_no || ''
    });
    
    // Load cascading location data
    if (staffMember.province_no) {
      loadDistricts(staffMember.province_no);
    }
    if (staffMember.district_no) {
      loadCommunes(staffMember.district_no);
    }
    if (staffMember.commune_no) {
      loadVillages(staffMember.commune_no);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.deleteStaff(id);
      alert('Staff deleted successfully');
      loadData();
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Failed to delete staff: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form:', form);

    // Validation
    if (!form.eng_name || !form.khmer_name || !form.phone || !form.positions) {
      alert('Please fill in all required fields');
      return;
    }

    if (!editingId && (!form.username || !form.email || !form.password)) {
      alert('Please fill in account information (username, email, password)');
      return;
    }

    const payload = {
      eng_name: form.eng_name.trim(),
      khmer_name: form.khmer_name.trim(),
      phone: form.phone.trim(),
      positions: parseInt(form.positions),
      province_no: parseInt(form.province_no) || 0,
      district_no: parseInt(form.district_no) || 0,
      commune_no: parseInt(form.commune_no) || 0,
      village_no: parseInt(form.village_no) || 0
    };

    // Add account info only when creating new staff
    if (!editingId) {
      payload.username = form.username.trim();
      payload.email = form.email.trim();
      payload.password = form.password;
    }

    console.log('Payload:', payload);

    try {
      if (editingId) {
        await api.updateStaff(editingId, payload);
        alert('Staff updated successfully');
      } else {
        await api.createStaff(payload);
        alert('Staff created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('Failed to save staff: ' + err.message);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Cascading dropdowns
    if (field === 'province_no') {
      loadDistricts(value);
      setForm(prev => ({ ...prev, district_no: '', commune_no: '', village_no: '' }));
      setCommunes([]);
      setVillages([]);
    } else if (field === 'district_no') {
      loadCommunes(value);
      setForm(prev => ({ ...prev, commune_no: '', village_no: '' }));
      setVillages([]);
    } else if (field === 'commune_no') {
      loadVillages(value);
      setForm(prev => ({ ...prev, village_no: '' }));
    }
  };

  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    try {
      const data = await api.getDistricts(provinceId);
      console.log('Districts loaded:', data);
      setDistricts(data || []);
    } catch (err) {
      console.error('Error loading districts:', err);
    }
  };

  const loadCommunes = async (districtId) => {
    if (!districtId) {
      setCommunes([]);
      return;
    }
    try {
      const data = await api.getCommunes(districtId);
      console.log('Communes loaded:', data);
      setCommunes(data || []);
    } catch (err) {
      console.error('Error loading communes:', err);
    }
  };

  const loadVillages = async (communeId) => {
    if (!communeId) {
      setVillages([]);
      return;
    }
    try {
      const data = await api.getVillages(communeId);
      console.log('Villages loaded:', data);
      setVillages(data || []);
    } catch (err) {
      console.error('Error loading villages:', err);
    }
  };

  // Filter staff by search query
  const filteredStaff = staff.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      (member.eng_name && member.eng_name.toLowerCase().includes(q)) ||
      (member.khmer_name && member.khmer_name.toLowerCase().includes(q)) ||
      (member.phone && member.phone.toString().includes(q)) ||
      (member.position_name && member.position_name.toLowerCase().includes(q)) ||
      (member.username && member.username.toLowerCase().includes(q))
    );
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Staff Management</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>
              Manage administrative and support staff
            </p>
          </div>
          <button 
            className="btn" 
            onClick={handleAdd}
            style={{ width: '140px', height: '36px', padding: '0' }}
          >
            + Add Staff
          </button>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="page-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, phone, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: '0 1 320px', minWidth: '220px' }}
            />
            {searchQuery && (
              <button className="btn btn-cancel" onClick={clearSearch} style={{ padding: '10px 16px' }}>
                ✕ Clear
              </button>
            )}
          </div>

          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
            borderRadius: '10px',
            fontSize: '0.85rem', 
            color: '#0c4a6e', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{fontSize:'1.2rem'}}>👔</span>
            Showing <strong>{filteredStaff.length}</strong> of <strong>{staff.length}</strong> staff
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>English Name</th>
                  <th>Khmer Name</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Username</th>
                  <th>Location</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : filteredStaff.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No staff found</td></tr>
                ) : (
                  filteredStaff.map(member => (
                    <tr key={member.Id}>
                      <td>
                        <div style={{fontWeight:600}}>{member.eng_name}</div>
                        <div style={{fontSize:'.75rem',color:'#64748b'}}>ID: {member.Id}</div>
                      </td>
                      <td>{member.khmer_name}</td>
                      <td>{member.phone}</td>
                      <td>
                        <span className={`badge`} style={{background:'#fef3c7',color:'#92400e',border:'1px solid #fcd34d'}}>
                          {member.position_name || '-'}
                        </span>
                      </td>
                      <td>{member.username || '-'}</td>
                      <td>{member.village_name || member.commune_name || member.district_name || member.province_name || '-'}</td>
                      <td style={{textAlign:'center'}}>
                        <button className="btn btn-sm" onClick={() => handleEdit(member)} style={{marginRight:4}}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-cancel" onClick={() => handleDelete(member.Id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" style={{maxWidth:800}} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Staff' : 'Add New Staff'}</h2>
                <button className="close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="staffForm">
                  
                  {!editingId && (
                    <div className="form-section">
                      <h3 className="section-title">
                        <span className="section-icon">🔐</span>
                        Account Information
                      </h3>
                      <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                        <div className="form-field">
                          <label className="form-label">Username <span className="required">*</span></label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter username"
                            value={form.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            required={!editingId}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Email <span className="required">*</span></label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="staff@example.com"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required={!editingId}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Password <span className="required">*</span></label>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required={!editingId}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">👤</span>
                      Personal Information
                    </h3>
                    <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                      <div className="form-field">
                        <label className="form-label">English Name <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter English name"
                          value={form.eng_name}
                          onChange={(e) => handleChange('eng_name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">Khmer Name <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter Khmer name"
                          value={form.khmer_name}
                          onChange={(e) => handleChange('khmer_name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">Phone <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="012 345 678"
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">💼</span>
                      Professional Information
                    </h3>
                    <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                      <div className="form-field">
                        <label className="form-label">Position <span className="required">*</span></label>
                        <select
                          className="form-input"
                          value={form.positions}
                          onChange={(e) => handleChange('positions', e.target.value)}
                          required
                        >
                          <option value="">Select Position</option>
                          {positions.map(pos => (
                            <option key={pos.id} value={pos.id}>{pos.position}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📍</span>
                      Location Information
                    </h3>
                    <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                      <div className="form-field">
                        <label className="form-label">Province</label>
                        <select
                          className="form-input"
                          value={form.province_no}
                          onChange={(e) => handleChange('province_no', e.target.value)}
                        >
                          <option value="">Select Province</option>
                          {provinces.map(prov => (
                            <option key={prov.province_no} value={prov.province_no}>{prov.province_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">District</label>
                        <select
                          className="form-input"
                          value={form.district_no}
                          onChange={(e) => handleChange('district_no', e.target.value)}
                          disabled={!form.province_no}
                        >
                          <option value="">Select District</option>
                          {districts.map(dist => (
                            <option key={dist.district_no} value={dist.district_no}>{dist.district_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">Commune</label>
                        <select
                          className="form-input"
                          value={form.commune_no}
                          onChange={(e) => handleChange('commune_no', e.target.value)}
                          disabled={!form.district_no}
                        >
                          <option value="">Select Commune</option>
                          {communes.map(comm => (
                            <option key={comm.commune_no} value={comm.commune_no}>{comm.commune_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">Village</label>
                        <select
                          className="form-input"
                          value={form.village_no}
                          onChange={(e) => handleChange('village_no', e.target.value)}
                          disabled={!form.commune_no}
                        >
                          <option value="">Select Village</option>
                          {villages.map(vill => (
                            <option key={vill.village_no} value={vill.village_no}>{vill.village_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                </form>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" form="staffForm" className="btn">
                  {editingId ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Staff;
