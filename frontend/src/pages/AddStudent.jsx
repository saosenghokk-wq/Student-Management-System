import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

// Searchable Select Component
function SearchableSelect({ options, value, onChange, placeholder, disabled, labelKey, valueKey, searchKeys }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = options.find(opt => opt[valueKey] === value);
  
  const filteredOptions = searchTerm
    ? options.filter(opt => 
        searchKeys.some(key => 
          String(opt[key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : options;

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: '' } });
    setSearchTerm('');
  };

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 40px 10px 14px',
          fontSize: '0.875rem',
          border: isOpen ? '2px solid #3b82f6' : '1px solid #d1d5db',
          borderRadius: '8px',
          background: disabled ? '#f9fafb' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '42px',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <span style={{ 
          color: selectedOption ? '#111827' : '#9ca3af',
          fontWeight: selectedOption ? '500' : '400',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          marginRight: '8px'
        }}>
          {selectedOption ? selectedOption[labelKey] : placeholder}
        </span>
        <span style={{ 
          position: 'absolute', 
          right: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}>
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
              }}
              title="Clear selection"
            >
              ×
            </button>
          )}
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
            style={{
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <path d="M2 4L6 8L10 4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      
      {isOpen && !disabled && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.05)'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
            maxHeight: '320px',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease-out'
          }}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderBottom: '1px solid #e5e7eb',
              padding: '10px 12px',
              zIndex: 1
            }}>
              <div style={{ position: 'relative' }}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.5"/>
                  <path d="M11 11L14 14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.875rem',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div style={{ 
              maxHeight: '250px', 
              overflowY: 'auto',
              padding: '4px'
            }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div
                    key={opt[valueKey]}
                    onClick={() => handleSelect(opt[valueKey])}
                    style={{
                      padding: '10px 14px',
                      margin: '2px 0',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      background: opt[valueKey] === value ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
                      color: opt[valueKey] === value ? '#1e40af' : '#374151',
                      fontWeight: opt[valueKey] === value ? '600' : '400',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      if (opt[valueKey] !== value) {
                        e.target.style.background = '#f9fafb';
                        e.target.style.paddingLeft = '18px';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (opt[valueKey] !== value) {
                        e.target.style.background = 'transparent';
                        e.target.style.paddingLeft = '14px';
                      }
                    }}
                  >
                    <span>{opt[labelKey]}</span>
                    {opt[valueKey] === value && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6.5 11.5L13 5" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '24px 14px', 
                  textAlign: 'center',
                  color: '#9ca3af', 
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                  No results found
                </div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export default function AddStudent() {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  
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
    nationality: '',
    race: '',
    marital_status: '0',
    department_id: '',
    program_id: '',
    batch_id: '',
    from_high_school: '',
    std_status_id: '',
    schoolarship_id: '',
    parent_id: '',
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: '',
    description: ''
  });

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [parents, setParents] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);

  const loadInitialData = useCallback(async () => {
    try {
      const [depts, stats, schol, pars, provs] = await Promise.all([
        api.getDepartments(),
        api.getStudentStatuses(),
        api.getScholarships(),
        api.getParents(),
        api.getProvinces()
      ]);
      setDepartments(depts);
      setStatuses(stats);
      setScholarships(schol);
      setParents(pars);
      setProvinces(provs);
    } catch (err) {
      showError('Failed to load form data');
    }
  }, [showError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setForm(f => ({ ...f, department_id: deptId, program_id: '', batch_id: '' }));
    if (deptId) {
      try {
        const progs = await api.getProgramsByDepartment(deptId);
        setPrograms(progs);
        setBatches([]);
      } catch (err) {
        showError('Failed to load programs');
      }
    } else {
      setPrograms([]);
      setBatches([]);
    }
  };

  const handleProgramChange = async (e) => {
    const progId = e.target.value;
    setForm(f => ({ ...f, program_id: progId, batch_id: '', student_code: '' }));
    if (progId) {
      try {
        const batchData = await api.getBatchesByProgram(progId);
        setBatches(batchData);
      } catch (err) {
        showError('Failed to load batches');
      }
    } else {
      setBatches([]);
    }
  };

  const handleBatchChange = async (e) => {
    const batchId = e.target.value;
    if (batchId) {
      try {
        // Get the selected batch info
        const selectedBatch = batches.find(b => b.Id === batchId);
        
        if (!selectedBatch) {
          showError('Batch not found');
          setForm(f => ({ ...f, batch_id: batchId, student_code: '' }));
          return;
        }
        
        // Get students in this batch to count them
        const studentsInBatch = await api.getStudentsByBatch(batchId);
        
        // Handle different response formats (array or object with data property)
        let studentCount = 0;
        if (Array.isArray(studentsInBatch)) {
          studentCount = studentsInBatch.length;
        } else if (studentsInBatch && Array.isArray(studentsInBatch.data)) {
          studentCount = studentsInBatch.data.length;
        } else if (studentsInBatch && typeof studentsInBatch.length === 'number') {
          studentCount = studentsInBatch.length;
        }
        
        // Generate student code: batch_code + (count + 1)
        const nextNumber = studentCount + 1;
        const newStudentCode = `${selectedBatch.batch_code}${String(nextNumber).padStart(3, '0')}`;
        
        setForm(f => ({ ...f, batch_id: batchId, student_code: newStudentCode }));
      } catch (err) {
        console.error('Error generating student code:', err);
        showError('Failed to generate student code');
        setForm(f => ({ ...f, batch_id: batchId, student_code: '' }));
      }
    } else {
      setForm(f => ({ ...f, batch_id: '', student_code: '' }));
    }
  };

  const handleProvinceChange = async (e) => {
    const provNo = e.target.value;
    setForm(f => ({ ...f, province_no: provNo, district_no: '', commune_no: '', village_no: '' }));
    if (provNo) {
      try {
        const dists = await api.getDistricts(provNo);
        setDistricts(dists);
        setCommunes([]);
        setVillages([]);
      } catch (err) {
        showError('Failed to load districts');
      }
    } else {
      setDistricts([]);
      setCommunes([]);
      setVillages([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const distNo = e.target.value;
    setForm(f => ({ ...f, district_no: distNo, commune_no: '', village_no: '' }));
    if (distNo) {
      try {
        const comms = await api.getCommunes(distNo);
        setCommunes(comms);
        setVillages([]);
      } catch (err) {
        showError('Failed to load communes');
      }
    } else {
      setCommunes([]);
      setVillages([]);
    }
  };

  const handleCommuneChange = async (e) => {
    const commNo = e.target.value;
    setForm(f => ({ ...f, commune_no: commNo, village_no: '' }));
    if (commNo) {
      try {
        const vills = await api.getVillages(commNo);
        setVillages(vills);
      } catch (err) {
        showError('Failed to load villages');
      }
    } else {
      setVillages([]);
    }
  };

  const handleVillageChange = (e) => {
    setForm(f => ({ ...f, village_no: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role_id: 4,
        student_code: form.student_code,
        std_eng_name: form.std_eng_name,
        std_khmer_name: form.std_khmer_name || null,
        gender: parseInt(form.gender, 10),
        dob: form.dob || null,
        phone: form.phone || null,
        nationality: form.nationality || null,
        race: form.race || null,
        marital_status: parseInt(form.marital_status, 10),
        department_id: parseInt(form.department_id, 10),
        program_id: parseInt(form.program_id, 10),
        batch_id: form.batch_id ? parseInt(form.batch_id, 10) : null,
        from_high_school: form.from_high_school,
        std_status_id: form.std_status_id ? parseInt(form.std_status_id, 10) : null,
        schoolarship_id: form.schoolarship_id ? parseInt(form.schoolarship_id, 10) : null,
        parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
        province_no: form.province_no ? parseInt(form.province_no, 10) : null,
        district_no: form.district_no ? parseInt(form.district_no, 10) : null,
        commune_no: form.commune_no ? parseInt(form.commune_no, 10) : null,
        village_no: form.village_no ? parseInt(form.village_no, 10) : null,
        description: form.description || null
      };

      await api.createStudent(payload);
      showSuccess('Student created successfully');
      setTimeout(() => navigate('/students'), 1000);
    } catch (err) {
      showError(err.message || 'Failed to create student');
    }
  };

  return (
    <DashboardLayout>
      <div className="page" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
            👨‍🎓 Add New Student
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Fill in the information below to create a new student record</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Account Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔐</span> Account Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Username <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="username" 
                      value={form.username} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Enter username"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Enter email address"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="password" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Enter secure password"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👤</span> Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Student Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="student_code" 
                      value={form.student_code} 
                      onChange={handleChange} 
                      required 
                      readOnly
                      className="form-input" 
                      placeholder="Auto-generated when batch is selected"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem', background: '#f9fafb', cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                      💡 Student code will be generated automatically based on batch code + student count
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      English Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="std_eng_name" 
                      value={form.std_eng_name} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Enter English name"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Khmer Name
                    </label>
                    <input 
                      name="std_khmer_name" 
                      value={form.std_khmer_name} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Enter Khmer name"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Gender
                    </label>
                    <select 
                      name="gender" 
                      value={form.gender} 
                      onChange={handleChange} 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="0">Male</option>
                      <option value="1">Female</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Date of Birth
                    </label>
                    <input 
                      type="date" 
                      name="dob" 
                      value={form.dob} 
                      onChange={handleChange} 
                      className="form-input"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Phone
                    </label>
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Enter phone"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Nationality
                    </label>
                    <input 
                      name="nationality" 
                      value={form.nationality} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Cambodian"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Race
                    </label>
                    <input 
                      name="race" 
                      value={form.race} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Khmer"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Marital Status
                    </label>
                    <select 
                      name="marital_status" 
                      value={form.marital_status} 
                      onChange={handleChange} 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="0">Single</option>
                      <option value="1">Married</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Family & Address */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🏠</span> Family & Address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Parent
                    </label>
                    <SearchableSelect
                      options={parents.map(p => ({
                        value: p.id,
                        label: `${p.parent_code} - ${p.father_name}${p.mother_name ? ` (Mother: ${p.mother_name})` : ''}`,
                        parent_code: p.parent_code,
                        father_name: p.father_name,
                        mother_name: p.mother_name
                      }))}
                      value={form.parent_id}
                      onChange={(e) => setForm(prev => ({ ...prev, parent_id: e.target.value }))}
                      placeholder="Select Parent"
                      labelKey="label"
                      valueKey="value"
                      searchKeys={['parent_code', 'father_name', 'mother_name']}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Province
                      </label>
                      <SearchableSelect
                        options={provinces.map(p => ({
                          value: p.province_no,
                          label: p.province_name
                        }))}
                        value={form.province_no}
                        onChange={handleProvinceChange}
                        placeholder="Select Province"
                        labelKey="label"
                        valueKey="value"
                        searchKeys={['label']}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        District
                      </label>
                      <SearchableSelect
                        options={districts.map(d => ({
                          value: d.district_no,
                          label: d.district_name
                        }))}
                        value={form.district_no}
                        onChange={handleDistrictChange}
                        placeholder="Select District"
                        disabled={!form.province_no}
                        labelKey="label"
                        valueKey="value"
                        searchKeys={['label']}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Commune
                      </label>
                      <SearchableSelect
                        options={communes.map(c => ({
                          value: c.commune_no,
                          label: c.commune_name
                        }))}
                        value={form.commune_no}
                        onChange={handleCommuneChange}
                        placeholder="Select Commune"
                        disabled={!form.district_no}
                        labelKey="label"
                        valueKey="value"
                        searchKeys={['label']}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Village
                      </label>
                      <SearchableSelect
                        options={villages.map(v => ({
                          value: v.village_no,
                          label: v.village_name
                        }))}
                        value={form.village_no}
                        onChange={handleVillageChange}
                        placeholder="Select Village"
                        disabled={!form.commune_no}
                        labelKey="label"
                        valueKey="value"
                        searchKeys={['label']}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Academic Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🎓</span> Academic Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Department <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="department_id" 
                      value={form.department_id} 
                      onChange={handleDepartmentChange} 
                      required 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Program <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="program_id" 
                      value={form.program_id} 
                      onChange={handleProgramChange} 
                      disabled={!form.department_id} 
                      required 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="">Select Program</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Batch
                    </label>
                    <select 
                      name="batch_id" 
                      value={form.batch_id} 
                      onChange={handleBatchChange} 
                      disabled={!form.program_id} 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="">Select Batch</option>
                      {batches.map(b => <option key={b.Id} value={b.Id}>{b.batch_code} ({b.academic_year})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      From High School <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="from_high_school" 
                      value={form.from_high_school} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      placeholder="Enter high school name"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select 
                      name="std_status_id" 
                      value={form.std_status_id} 
                      onChange={handleChange} 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="">Select Status</option>
                      {statuses.map(s => <option key={s.id} value={s.id}>{s.std_status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Scholarship
                    </label>
                    <select 
                      name="schoolarship_id" 
                      value={form.schoolarship_id} 
                      onChange={handleChange} 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="">No Scholarship</option>
                      {scholarships.map(s => <option key={s.id} value={s.id}>{s.scholarship}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📝</span> Additional Information
                </h3>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    rows={4} 
                    placeholder="Add any additional notes..."
                    className="form-textarea"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div style={{ 
            position: 'sticky',
            bottom: 0,
            background: 'white',
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            display: 'flex', 
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/students')} 
              className="btn btn-cancel"
              style={{ 
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '120px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-submit"
              style={{ 
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '120px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              ✓ Create Student
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
