import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Students() {
  const { showSuccess, showError } = useAlert();
  const [students, setStudents] = useState([]);
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
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

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [showModal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    
    try {
      // Validate required fields
      if (!form.username || !form.email || !form.password) {
        showError('Username, email, and password are required');
        return;
      }
      if (!form.student_code || !form.std_eng_name) {
        showError('Student code and English name are required');
        return;
      }
      if (!form.from_high_school) {
        showError('High school name is required');
        return;
      }
      if (!form.department_id) {
        showError('Department is required');
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
      setStudents([newStudent, ...students]);
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
      showError(err.message || 'Failed to create student');
    }
  };

  // Helpers to map IDs to display names
  const getDepartmentName = (deptId, fallbackName) => {
    return allDepartments.find(d => d.id === deptId)?.department_name || fallbackName || 'N/A';
  };
  const getBatchCode = (batchId, fallbackCode) => {
    return allBatches.find(b => b.Id === batchId)?.batch_code || fallbackCode || 'N/A';
  };
  const getScholarshipName = (scholarshipId) => {
    if (!scholarshipId) return 'No Scholarship';
    return allScholarships.find(s => s.id === scholarshipId)?.scholarship || 'No Scholarship';
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
    
    const matchesDepartment = !filterDepartment || Number(student.department_id) === Number(filterDepartment);
    const matchesBatch = !filterBatch || Number(student.batch_id) === Number(filterBatch);
    
    return matchesSearch && matchesDepartment && matchesBatch;
  });

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      showSuccess('Student deleted successfully!');
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (e) {
      const errorMsg = e.message || 'Failed to delete student';
      if (errorMsg.includes('cannot') || errorMsg.includes("can't") || errorMsg.includes('not allowed')) {
        showError(`Cannot delete this student: ${errorMsg}`);
      } else {
        showError(errorMsg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  if (loading) return <DashboardLayout><div className="loader">Loading students...</div></DashboardLayout>;

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
              🎓 Students Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage and view all student records</p>
          </div>
          <button
            onClick={() => window.location.href = '/students/add'}
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
            ➕ Add Student
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

      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Search and Filter Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>👨‍🎓</span> Students List
            </h3>
            <span style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
              {filteredStudents.length} students
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.1rem'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            
            {/* Department Filter */}
            <div style={{ minWidth: '200px' }}>
              <select
                value={filterDepartment}
                onChange={(e) => onChangeFilterDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.95rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">🏛️ All Departments</option>
                {allDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                ))}
              </select>
            </div>
            
            {/* Batch Filter */}
            <div style={{ minWidth: '200px' }}>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.95rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">🎓 All Batches</option>
                {filteredBatches.map(batch => (
                  <option key={batch.Id} value={batch.Id}>{batch.batch_code} ({batch.academic_year})</option>
                ))}
              </select>
            </div>
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
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '140px' }}>Student Code</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '100px' }}>Gender</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Scholarship</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Department</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '130px' }}>Batch Code</th>
                <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const startIndex = (currentPage - 1) * entriesPerPage;
                const endIndex = startIndex + entriesPerPage;
                const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
                
                return paginatedStudents.length > 0 ? (
                  paginatedStudents.map((s, index) => {
                  const deptName = getDepartmentName(s.department_id, s.department_name);
                  const batchCode = getBatchCode(s.batch_id, s.batch_code);
                  const scholarshipName = getScholarshipName(s.schoolarship_id);
                  const genderText = s.gender === '1' ? 'Female' : 'Male';
                  return (
                    <tr 
                      key={s.id}
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
                      <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                        {s.student_code}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                        {s.std_eng_name}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          background: genderText === 'Female' ? '#fce7f3' : '#dbeafe', 
                          color: genderText === 'Female' ? '#be185d' : '#1e40af', 
                          padding: '4px 10px', 
                          borderRadius: 6, 
                          fontWeight: 500, 
                          fontSize: '.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {genderText === 'Female' ? '♀️' : '♂️'} {genderText}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontWeight: 500, fontSize:'.75rem' }}>
                          {scholarshipName}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 6, fontWeight: 500, fontSize:'.75rem' }}>
                          {deptName}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: 6, fontWeight: 500, fontSize:'.75rem' }}>
                          {batchCode}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <button 
                            onClick={() => window.location.href = `/students/${s.id}`}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              border: 'none',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: 'white',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap'
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
                            👁️ View
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(s)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              border: 'none',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap'
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
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '0.875rem' }}>
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
            );
              })()}
          </tbody>
        </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredStudents.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filteredStudents.length)} to {Math.min(currentPage * entriesPerPage, filteredStudents.length)} of {filteredStudents.length} entries
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
                {currentPage} / {Math.ceil(filteredStudents.length / entriesPerPage)}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredStudents.length / entriesPerPage)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? '#f1f5f9' : '#fff',
                  color: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? '#94a3b8' : '#475569',
                  cursor: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? 'not-allowed' : 'pointer',
                  fontWeight: 500
                }}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(Math.ceil(filteredStudents.length / entriesPerPage))}
                disabled={currentPage >= Math.ceil(filteredStudents.length / entriesPerPage)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? '#f1f5f9' : '#fff',
                  color: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? '#94a3b8' : '#475569',
                  cursor: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? 'not-allowed' : 'pointer',
                  fontWeight: 500
                }}
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && studentToDelete && (
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
                    Delete Student?
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: '#64748b',
                    lineHeight: '1.6'
                  }}>
                    Are you sure you want to delete this student?
                  </p>
                </div>

                {/* Student Info Card */}
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
                      🎓
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '1.05rem',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        {studentToDelete.std_eng_name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        {studentToDelete.student_code}
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
                  ⚠️ This action cannot be undone. All data associated with this student will be permanently deleted.
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
                      '🗑️ Delete Student'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
