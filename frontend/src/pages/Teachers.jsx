import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Teachers() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teacherTypes, setTeacherTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    eng_name: '',
    khmer_name: '',
    phone: '',
    teacher_types_id: '',
    position: '',
    department_id: '',
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const results = await Promise.all([
        api.getTeachers().catch(err => { console.error('❌ Teachers error:', err); return []; }),
        api.getDepartments().catch(err => { console.error('❌ Departments error:', err); return []; }),
        api.getTeacherTypes().catch(err => { console.error('❌ Teacher Types error:', err); return []; }),
        api.getPositions().catch(err => { console.error('❌ Positions error:', err); return []; }),
        api.getProvinces().catch(err => { console.error('❌ Provinces error:', err); return []; })
      ]);
      
      setTeachers(results[0]);
      setDepartments(results[1]);
      setTeacherTypes(results[2]);
      setPositions(results[3]);
      setProvinces(results[4]);
      
      console.log('✅ Teachers loaded:', results[0]?.length || 0);
      console.log('✅ Departments loaded:', results[1]?.length || 0);
      console.log('✅ Teacher Types loaded:', results[2]?.length || 0);
      console.log('✅ Positions loaded:', results[3]?.length || 0);
      console.log('✅ Provinces loaded:', results[4]?.length || 0);
    } catch (err) {
      console.error('Error loading data:', err);
      alert('Failed to load data');
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Location cascade
    if (name === 'province_no') {
      setDistricts([]);
      setCommunes([]);
      setVillages([]);
      setForm({ ...form, province_no: value, district_no: '', commune_no: '', village_no: '' });
      if (value) {
        const data = await api.getDistricts(value).catch(() => []);
        setDistricts(data);
      }
    } else if (name === 'district_no') {
      setCommunes([]);
      setVillages([]);
      setForm({ ...form, district_no: value, commune_no: '', village_no: '' });
      if (value) {
        const data = await api.getCommunes(value).catch(() => []);
        setCommunes(data);
      }
    } else if (name === 'commune_no') {
      setVillages([]);
      setForm({ ...form, commune_no: value, village_no: '' });
      if (value) {
        const data = await api.getVillages(value).catch(() => []);
        setVillages(data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // When editing, don't send password/username/email unless changed
        const updateData = {
          eng_name: form.eng_name,
          khmer_name: form.khmer_name,
          phone: form.phone,
          teacher_types_id: form.teacher_types_id,
          position: form.position,
          department_id: form.department_id,
          province_no: form.province_no || null,
          district_no: form.district_no || null,
          commune_no: form.commune_no || null,
          village_no: form.village_no || null
        };
        await api.updateTeacher(editingId, updateData);
        showSuccess('Teacher updated successfully');
      } else {
        const newTeacher = await api.createTeacher(form);
        setTeachers(prev => [newTeacher, ...prev]);
        showSuccess('Teacher created successfully');
      }
      if (editingId) loadData();
      closeModal();
    } catch (err) {
      showError(err.message || 'Operation failed');
    }
  };

  const handleEdit = async (teacher) => {
    setEditingId(teacher.id);
    
    // Load location cascade if location exists
    if (teacher.province_no) {
      const dists = await api.getDistricts(teacher.province_no).catch(() => []);
      setDistricts(dists);
      
      if (teacher.district_no) {
        const comms = await api.getCommunes(teacher.district_no).catch(() => []);
        setCommunes(comms);
        
        if (teacher.commune_no) {
          const vills = await api.getVillages(teacher.commune_no).catch(() => []);
          setVillages(vills);
        }
      }
    }
    
    setForm({
      username: teacher.username || '',
      email: teacher.email || '',
      password: '',
      eng_name: teacher.eng_name || '',
      khmer_name: teacher.khmer_name || '',
      phone: teacher.phone || '',
      teacher_types_id: teacher.teacher_types_id || '',
      position: teacher.position || '',
      department_id: teacher.department_id || '',
      province_no: teacher.province_no || '',
      district_no: teacher.district_no || '',
      commune_no: teacher.commune_no || '',
      village_no: teacher.village_no || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await api.deleteTeacher(id);
      showSuccess('Teacher deleted successfully');
      loadData();
    } catch (err) {
      showError(err.message || 'Delete failed');
    }
  };

  const openModal = () => {
    setEditingId(null);
    setForm({
      username: '',
      email: '',
      password: '',
      eng_name: '',
      khmer_name: '',
      phone: '',
      teacher_types_id: '',
      position: '',
      department_id: '',
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

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const filteredTeachers = teachers.filter(t =>
    t.eng_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.khmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              👨‍🏫 Teachers Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage and view all teacher records</p>
          </div>
          <button
            onClick={() => window.location.href = '/teachers/add'}
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
            ➕ Add Teacher
          </button>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="page-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, phone, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: '0 1 320px', minWidth: '220px' }}
            />
            {searchQuery && (
              <button className="btn btn-cancel" onClick={() => setSearchQuery('')} style={{ padding: '10px 16px' }}>
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
            <span style={{fontSize:'1.2rem'}}>👨‍🏫</span>
            Showing <strong>{filteredTeachers.length}</strong> of <strong>{teachers.length}</strong> teachers
          </div>
        </div>

        {/* Table */}
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
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Teachers List</h3>
            <span style={{ 
              marginLeft: 'auto', 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 12px', 
              borderRadius: '16px', 
              fontSize: '0.875rem' 
            }}>
              {filteredTeachers.length} teachers
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
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:'60px'}}>No</th>
                  <th>English Name</th>
                  <th>Khmer Name</th>
                  <th>Phone</th>
                  <th>Teacher Type</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const startIndex = (currentPage - 1) * entriesPerPage;
                  const endIndex = startIndex + entriesPerPage;
                  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
                  
                  return paginatedTeachers.map((teacher, index) => (
                    <tr 
                      key={teacher.id}
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
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{teacher.eng_name}</div>
                            <div style={{ fontSize: '.75rem', color: '#64748b' }}>ID: {teacher.id}</div>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {teacher.khmer_name}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {teacher.phone}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span className={`badge success`}>
                              {teacher.teacher_type_name || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span className={`badge`} style={{background:'#fef3c7',color:'#92400e',border:'1px solid #fcd34d'}}>
                              {teacher.position_name || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                            {teacher.department_name || '-'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEdit(teacher)}
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
                              onClick={() => handleDelete(teacher.id)}
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
                  ));
                })()}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '0.875rem' }}>
                      {searchQuery ? `No teachers found matching "${searchQuery}"` : 'No teachers yet. Click "Add Teacher" to create a new record.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" style={{maxWidth:800}} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                <button className="close" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="teacherForm">
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
                              name="username"
                              value={form.username}
                              onChange={handleChange}
                              required={!editingId}
                              placeholder="Enter username"
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label">Email <span className="required">*</span></label>
                            <input
                              type="email"
                              className="form-input"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              required={!editingId}
                              placeholder="teacher@example.com"
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label">Password <span className="required">*</span></label>
                            <input
                              type="password"
                              className="form-input"
                              name="password"
                              value={form.password}
                              onChange={handleChange}
                              required={!editingId}
                              placeholder="Min. 6 characters"
                            />
                          </div>
                        </div>
                      </div>
                  )}
                  
                  {/* Personal Information Section */}
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
                          name="eng_name"
                          value={form.eng_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter English name"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Khmer Name <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          name="khmer_name"
                          value={form.khmer_name}
                          onChange={handleChange}
                          required
                          placeholder="បញ្ចូលឈ្មោះខ្មែរ"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Phone <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="012 345 678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">💼</span>
                      Professional Information
                    </h3>
                    <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                      <div className="form-field">
                        <label className="form-label">Teacher Type <span className="required">*</span></label>
                        <select
                          className="form-input"
                          name="teacher_types_id"
                          value={form.teacher_types_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{teacherTypes.length === 0 ? 'Loading...' : 'Select Type'}</option>
                          {teacherTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.types}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Position <span className="required">*</span></label>
                        <select
                          className="form-input"
                          name="position"
                          value={form.position}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{positions.length === 0 ? 'Loading...' : 'Select Position'}</option>
                          {positions.map((pos) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.position}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Department <span className="required">*</span></label>
                        <select
                          className="form-input"
                          name="department_id"
                          value={form.department_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{departments.length === 0 ? 'Loading...' : 'Select Department'}</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.department_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📍</span>
                      Location Information (Optional)
                    </h3>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label className="form-label">Province</label>
                        <select
                          className="form-input"
                          name="province_no"
                          value={form.province_no}
                          onChange={handleChange}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((p) => (
                            <option key={p.province_no} value={p.province_no}>
                              {p.province_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">District</label>
                        <select
                          className="form-input"
                          name="district_no"
                          value={form.district_no}
                          onChange={handleChange}
                          disabled={!form.province_no}
                        >
                          <option value="">{!form.province_no ? 'Select Province First' : 'Select District'}</option>
                          {districts.map((d) => (
                            <option key={d.district_no} value={d.district_no}>
                              {d.district_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Commune</label>
                        <select
                          className="form-input"
                          name="commune_no"
                          value={form.commune_no}
                          onChange={handleChange}
                          disabled={!form.district_no}
                        >
                          <option value="">{!form.district_no ? 'Select District First' : 'Select Commune'}</option>
                          {communes.map((c) => (
                            <option key={c.commune_no} value={c.commune_no}>
                              {c.commune_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Village</label>
                        <select
                          className="form-input"
                          name="village_no"
                          value={form.village_no}
                          onChange={handleChange}
                          disabled={!form.commune_no}
                        >
                          <option value="">{!form.commune_no ? 'Select Commune First' : 'Select Village'}</option>
                          {villages.map((v) => (
                            <option key={v.village_no} value={v.village_no}>
                              {v.village_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" form="teacherForm" className="btn">
                  {editingId ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
