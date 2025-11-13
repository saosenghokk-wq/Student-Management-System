import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Students() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [parents, setParents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [allDepartments, setAllDepartments] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [allScholarships, setAllScholarships] = useState([]);
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    student_code: '',
    std_eng_name: '',
    std_khmer_name: '',
    gender: '0',
    dob: '',
    phone: '',
    department_id: '',
    program_id: '',
    batch_id: '',
    nationality: 'Cambodian',
    race: 'Khmer',
    from_high_school: '',
    marital_status: '0',
    parent_id: '',
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: '',
    std_status_id: '',
    schoolarship_id: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [showModal]);

  const loadData = async () => {
    try {
      const studentsData = await api.getStudents();
      setStudents(studentsData);
      
      // Load filter data (departments and batches for filtering)
      const deptData = await api.getDepartments();
      setAllDepartments(deptData);
      // Programs for mapping department -> program(s)
      try {
        const programsData = await api.getPrograms();
        setAllPrograms(programsData || []);
      } catch (e) {
        setAllPrograms([]);
      }
      // Load scholarships for display mapping
      try {
        const scholarshipsData = await api.getScholarships();
        setAllScholarships(scholarshipsData);
      } catch (e) {
        // ignore if not available
      }
      
      // Load all batches for filtering (use API client)
      try {
        const allBatchesData = await api.getBatches();
        setAllBatches(allBatchesData);
        setFilteredBatches(allBatchesData);
      } catch (err) {
        console.log('Could not load batches for filtering');
      }
      
      // Load dropdown data when modal opens
      if (showModal) {
        console.log('Loading dropdown data...');
        const [parentData, provinceData, statusData, scholarshipData] = await Promise.all([
          api.getParents(),
          api.getProvinces(),
          api.getStudentStatuses(),
          api.getScholarships()
        ]);
        console.log('Departments:', deptData);
        console.log('Statuses:', statusData);
        console.log('Scholarships:', scholarshipData);
        setDepartments(deptData);
        setParents(parentData);
        setProvinces(provinceData);
        setStatuses(statusData);
        setScholarships(scholarshipData);
        // Programs and batches will be loaded based on department/program selection
        setPrograms([]);
        setBatches([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Relationship: when department filter changes, filter batches to only those belonging to that department (via programs)
  const onChangeFilterDepartment = async (deptId) => {
    setFilterDepartment(deptId);
    setFilterBatch('');
    if (!deptId) {
      setFilteredBatches(allBatches);
      return;
    }
    // If we have programs with department mapping, filter by those programs; otherwise, fetch per program
    let deptPrograms = allPrograms.filter(p => String(p.department_id) === String(deptId));
    if (deptPrograms.length > 0) {
      // Filter existing batches whose program_id is in deptPrograms
      const programIds = new Set(deptPrograms.map(p => String(p.id)));
      const fb = allBatches.filter(b => String(b.program_id || b.ProgramId || b.programId || '') && programIds.has(String(b.program_id || b.ProgramId || b.programId)));
      if (fb.length > 0) {
        setFilteredBatches(fb);
        return;
      }
      // Fallback: fetch batches per program
    } else {
      // No program mapping loaded; try fetching by department's programs
      try {
        deptPrograms = await api.getProgramsByDepartment(deptId);
      } catch (e) {
        deptPrograms = [];
      }
    }
    if (deptPrograms.length > 0) {
      try {
        const batchesArrays = await Promise.all(
          deptPrograms.map(pr => api.getBatchesByProgram(pr.id))
        );
        const merged = [].concat(...batchesArrays);
        setFilteredBatches(merged);
      } catch (e) {
        setFilteredBatches([]);
      }
    } else {
      setFilteredBatches([]);
    }
  };

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setForm({ ...form, department_id: departmentId, program_id: '', batch_id: '' });
    setPrograms([]);
    setBatches([]);
    
    if (departmentId) {
      try {
        console.log('Loading programs for department:', departmentId);
        const programData = await api.getProgramsByDepartment(departmentId);
        console.log('Programs loaded:', programData);
        setPrograms(programData);
      } catch (err) {
        console.error('Error loading programs:', err);
        setError(err.message);
      }
    }
  };

  const handleProgramChange = async (e) => {
    const programId = e.target.value;
    setForm({ ...form, program_id: programId, batch_id: '' });
    setBatches([]);
    
    if (programId) {
      try {
        console.log('Loading batches for program:', programId);
        const batchData = await api.getBatchesByProgram(programId);
        console.log('Batches loaded:', batchData);
        setBatches(batchData);
      } catch (err) {
        console.error('Error loading batches:', err);
        setError(err.message);
      }
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceNo = e.target.value;
    
    console.log('Province selected - no:', provinceNo);
    setForm({ ...form, province_no: provinceNo, district_no: '', commune_no: '', village_no: '' });
    setDistricts([]);
    setCommunes([]);
    setVillages([]);
    
    if (provinceNo) {
      try {
        console.log('Loading districts for province no:', provinceNo);
        const districtData = await api.getDistricts(provinceNo);
        console.log('Districts loaded:', districtData);
        setDistricts(districtData);
      } catch (err) {
        console.error('Error loading districts:', err);
        setError(err.message);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtNo = e.target.value;
    
    console.log('District selected - no:', districtNo);
    setForm({ ...form, district_no: districtNo, commune_no: '', village_no: '' });
    setCommunes([]);
    setVillages([]);
    
    if (districtNo) {
      try {
        console.log('Loading communes for district no:', districtNo);
        const communeData = await api.getCommunes(districtNo);
        console.log('Communes loaded:', communeData);
        setCommunes(communeData);
      } catch (err) {
        console.error('Error loading communes:', err);
        setError(err.message);
      }
    }
  };

  const handleCommuneChange = async (e) => {
    const communeNo = e.target.value;
    
    console.log('Commune selected - no:', communeNo);
    setForm({ ...form, commune_no: communeNo, village_no: '' });
    setVillages([]);
    
    if (communeNo) {
      try {
        console.log('Loading villages for commune no:', communeNo);
        const villageData = await api.getVillages(communeNo);
        console.log('Villages loaded:', villageData);
        setVillages(villageData);
      } catch (err) {
        console.error('Error loading villages:', err);
        setError(err.message);
      }
    }
  };

  const handleVillageChange = (e) => {
    const villageNo = e.target.value;
    
    console.log('Village selected - no:', villageNo);
    setForm({ ...form, village_no: villageNo });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validate required fields
      if (!form.username || !form.email || !form.password) {
        setError('❌ Username, email, and password are required');
        return;
      }
      if (!form.student_code || !form.std_eng_name) {
        setError('❌ Student code and English name are required');
        return;
      }
      if (!form.from_high_school) {
        setError('❌ High school name is required');
        return;
      }
      if (!form.department_id) {
        setError('❌ Department is required');
        return;
      }
      
      // Clean up form data - convert empty strings to proper defaults for numeric fields
      const cleanForm = {
        ...form,
        phone: form.phone ? form.phone : '',
        dob: form.dob || null,
        department_id: form.department_id,
        program_id: form.program_id || '',
        batch_id: form.batch_id || '',
        parent_id: form.parent_id || '',
        province_no: form.province_no || '',
        district_no: form.district_no || '',
        commune_no: form.commune_no || '',
        village_no: form.village_no || '',
        std_status_id: form.std_status_id || '',
        schoolarship_id: form.schoolarship_id || ''
      };
      
      console.log('Submitting form:', cleanForm);
      const newStudent = await api.createStudent(cleanForm);
      console.log('Student created:', newStudent);
      setStudents([...students, newStudent]);
      setShowModal(false);
      setForm({
        username: '',
        email: '',
        password: '',
        student_code: '',
        std_eng_name: '',
        std_khmer_name: '',
        gender: '0',
        dob: '',
        phone: '',
        department_id: '',
        program_id: '',
        batch_id: '',
        nationality: 'Cambodian',
        race: 'Khmer',
        from_high_school: '',
        marital_status: '0',
        parent_id: '',
        province_no: '',
        district_no: '',
        commune_no: '',
        village_no: '',
        std_status_id: '',
        schoolarship_id: '',
        description: ''
      });
      showSuccess('Student created successfully!');
    } catch (err) {
      console.error('Error creating student:', err);
      setError('❌ ' + (err.message || 'Failed to create student'));
    }
  };

  // Helpers to map IDs to display names
  const getDepartmentName = (deptId, fallbackName) => {
    return allDepartments.find(d => d.id == deptId)?.department_name || fallbackName || 'N/A';
  };
  const getBatchCode = (batchId, fallbackCode) => {
    return allBatches.find(b => b.Id == batchId)?.batch_code || fallbackCode || 'N/A';
  };
  const getScholarshipName = (scholarshipId) => {
    if (!scholarshipId) return 'No Scholarship';
    return allScholarships.find(s => s.id == scholarshipId)?.scholarship || 'No Scholarship';
  };

  // Filter students based on search query, department, and batch
  const filteredStudents = students.filter(student => {
    const deptName = getDepartmentName(student.department_id, student.department_name);
    const batchCode = getBatchCode(student.batch_id, student.batch_code);
    const scholarshipName = getScholarshipName(student.schoolarship_id);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      student.std_eng_name?.toLowerCase().includes(q) ||
      student.std_khmer_name?.toLowerCase().includes(q) ||
      student.student_code?.toLowerCase().includes(q) ||
      deptName.toLowerCase().includes(q) ||
      batchCode.toLowerCase().includes(q) ||
      scholarshipName.toLowerCase().includes(q);
    
    const matchesDepartment = !filterDepartment || student.department_id == filterDepartment;
    const matchesBatch = !filterBatch || student.batch_id == filterBatch;
    
    return matchesSearch && matchesDepartment && matchesBatch;
  });

  if (loading) return <DashboardLayout><div className="loader">Loading students...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Students</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>Manage and view all student records</p>
          </div>
          <button className="btn" onClick={() => setShowModal(true)} style={{ width: '120px', height: '36px', padding: '0' }}>
            + Add Student
          </button>
        </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" style={{maxWidth:800}} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            {/* Form Content */}
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="studentForm">
                {/* Account Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">🔐</span>
                    Account Information
                  </h3>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">Username <span className="required">*</span></label>
                      <input name="username" value={form.username} onChange={handleChange} required className="form-input" placeholder="Enter username" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Email <span className="required">*</span></label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required className="form-input" placeholder="Enter email address" />
                    </div>
                    <div className="form-field form-field-full">
                      <label className="form-label">Password <span className="required">*</span></label>
                      <input type="password" name="password" value={form.password} onChange={handleChange} required className="form-input" placeholder="Enter secure password" />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Personal Information
                  </h3>
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label className="form-label">Student Code <span className="required">*</span></label>
                      <input name="student_code" value={form.student_code} onChange={handleChange} required className="form-input" placeholder="e.g., STU001" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">English Name <span className="required">*</span></label>
                      <input name="std_eng_name" value={form.std_eng_name} onChange={handleChange} required className="form-input" placeholder="Enter English name" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Khmer Name</label>
                      <input name="std_khmer_name" value={form.std_khmer_name} onChange={handleChange} className="form-input" placeholder="Enter Khmer name" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                        <option value="0">Male</option>
                        <option value="1">Female</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Date of Birth</label>
                      <input type="date" name="dob" value={form.dob} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="Enter phone number" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Nationality</label>
                      <input name="nationality" value={form.nationality} onChange={handleChange} className="form-input" placeholder="e.g., Cambodian" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Race</label>
                      <input name="race" value={form.race} onChange={handleChange} className="form-input" placeholder="e.g., Khmer" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Marital Status</label>
                      <select name="marital_status" value={form.marital_status} onChange={handleChange} className="form-select">
                        <option value="0">Single</option>
                        <option value="1">Married</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">🎓</span>
                    Academic Information
                  </h3>
                  <div className="form-grid-vertical">
                    <div className="form-field">
                      <label className="form-label">Department <span className="required">*</span></label>
                      <select name="department_id" value={form.department_id} onChange={handleDepartmentChange} required className="form-select">
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Program <span className="required">*</span></label>
                      <select name="program_id" value={form.program_id} onChange={handleProgramChange} disabled={!form.department_id} required className="form-select">
                        <option value="">Select Program</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Batch</label>
                      <select name="batch_id" value={form.batch_id} onChange={handleChange} disabled={!form.program_id} className="form-select">
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.Id} value={b.Id}>{b.batch_code} ({b.academic_year})</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">From High School <span className="required">*</span></label>
                      <input name="from_high_school" value={form.from_high_school} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Status</label>
                      <select name="std_status_id" value={form.std_status_id} onChange={handleChange} className="form-select">
                        <option value="">Select Status</option>
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.std_status}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Scholarship</label>
                      <select name="schoolarship_id" value={form.schoolarship_id} onChange={handleChange} className="form-select">
                        <option value="">No Scholarship</option>
                        {scholarships.map(s => <option key={s.id} value={s.id}>{s.scholarship}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Family & Address */}
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">🏠</span>
                    Family & Address Information
                  </h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Parent</label>
                      <select name="parent_id" value={form.parent_id} onChange={handleChange} className="form-select">
                        <option value="">Select Parent</option>
                        {parents.map(p => <option key={p.id} value={p.id}>{p.parent_code} - {p.father_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Province</label>
                      <select name="province_no" value={form.province_no} onChange={handleProvinceChange} className="form-select">
                        <option value="">Select Province</option>
                        {provinces.map(p => <option key={p.province_no} value={p.province_no}>{p.province_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">District</label>
                      <select name="district_no" value={form.district_no} onChange={handleDistrictChange} disabled={!form.province_no} className="form-select">
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d.district_no} value={d.district_no}>{d.district_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Commune</label>
                      <select name="commune_no" value={form.commune_no} onChange={handleCommuneChange} disabled={!form.district_no} className="form-select">
                        <option value="">Select Commune</option>
                        {communes.map(c => <option key={c.commune_no} value={c.commune_no}>{c.commune_name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Village</label>
                      <select name="village_no" value={form.village_no} onChange={handleVillageChange} disabled={!form.commune_no} className="form-select">
                        <option value="">Select Village</option>
                        {villages.map(v => <option key={v.village_no} value={v.village_no}>{v.village_name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">📝</span>
                    Additional Information
                  </h3>
                  <div className="form-field-vertical">
                    <label className="form-label-vertical">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Add any additional notes..." className="form-textarea" />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" form="studentForm" className="btn btn-submit">
                ✓ Create Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="page-actions">
          {/* Search Box */}
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, code, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: '0 1 280px', minWidth: '220px' }}
          />

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => onChangeFilterDepartment(e.target.value)}
            className="form-field"
            style={{ flex: '0 1 240px', padding: '10px 12px' }}
            title={allDepartments.find(d => String(d.id) === String(filterDepartment))?.department_name || 'All Departments'}
          >
            <option value="">All Departments</option>
            {allDepartments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.department_name}</option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="form-field"
            style={{ flex: '0 1 240px', padding: '10px 12px' }}
            title={
              (filterBatch && (filteredBatches.find(b => String(b.Id) === String(filterBatch))?.batch_code))
              || 'All Batches'
            }
          >
            <option value="">All Batches</option>
            {filteredBatches.map(batch => (
              <option key={batch.Id} value={batch.Id}>{batch.batch_code} ({batch.academic_year})</option>
              ))}
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || filterDepartment || filterBatch) && (
            <button
              className="btn btn-cancel"
              onClick={() => {
                setSearchQuery('');
                setFilterDepartment('');
                setFilterBatch('');
              }}
              style={{ padding: '10px 20px' }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
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
          <span style={{fontSize:'1.2rem'}}>📊</span>
          Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{width:'120px'}}>Student Code</th>
                <th>Name</th>
                <th style={{width:'80px'}}>Gender</th>
                <th>Scholarship</th>
                <th>Department</th>
                <th>Batch Code</th>
                <th style={{width:'120px',textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(s => {
                  const deptName = getDepartmentName(s.department_id, s.department_name);
                  const batchCode = getBatchCode(s.batch_id, s.batch_code);
                  const scholarshipName = getScholarshipName(s.schoolarship_id);
                  const genderText = s.gender === '1' ? 'Female' : 'Male';
                  return (
                    <tr key={s.id}>
                      <td style={{fontWeight:600}}>{s.student_code}</td>
                      <td>{s.std_eng_name}</td>
                      <td>{genderText}</td>
                      <td>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontWeight: 500, fontSize:'.75rem' }}>
                          {scholarshipName}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 6, fontWeight: 500, fontSize:'.75rem' }}>
                          {deptName}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: 6, fontWeight: 500, fontSize:'.75rem' }}>
                          {batchCode}
                        </span>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <button 
                          className="btn btn-sm"
                          onClick={() => window.location.href = `/students/${s.id}`}
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
              <tr>
                <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: '.95rem' }}>
                  {searchQuery || filterDepartment || filterBatch ? (
                    <>
                      <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>No students found</div>
                      <div style={{ fontSize: '.85rem' }}>Try adjusting your search or filters</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '2rem', marginBottom: 12 }}>📚</div>
                      <div style={{ fontWeight: 600 }}>No students yet</div>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
