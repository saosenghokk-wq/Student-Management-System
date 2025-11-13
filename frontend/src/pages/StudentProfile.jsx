import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import '../styles/modal.css';

function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAcademicEditModal, setShowAcademicEditModal] = useState(false);
  const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);
  const [showAddressEditModal, setShowAddressEditModal] = useState(false);
  const [showParentAccountEditModal, setShowParentAccountEditModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  
  // Get current user role
  const currentUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const isStudent = currentUser.role_id === 4;
  const isAdmin = currentUser.role_id === 1;
  
  const [academicForm, setAcademicForm] = useState({
    department_id: '',
    program_id: '',
    batch_id: '',
    from_high_school: '',
    std_status_id: '',
    schoolarship_id: ''
  });
  const [personalForm, setPersonalForm] = useState({
    student_code: '',
    std_eng_name: '',
    std_khmer_name: '',
    gender: '',
    dob: '',
    phone: '',
    nationality: '',
    race: '',
    marital_status: ''
  });
  const [addressForm, setAddressForm] = useState({
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: ''
  });
  const [parentAccountForm, setParentAccountForm] = useState({
    parent_id: '',
    username: '',
    email: '',
    status: ''
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

  useEffect(() => {
    loadStudentDetails();
  }, [id]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getStudent(id);
      console.log('Student details:', data);
      console.log('User ID from student:', data.user_id);
      console.log('Status from student:', data.status);
      setStudent(data);
      
      // Pre-fill forms
      setAcademicForm({
        department_id: data.department_id || '',
        program_id: data.program_id || '',
        batch_id: data.batch_id || '',
        from_high_school: data.from_high_school || '',
        std_status_id: data.std_status_id || '',
        schoolarship_id: data.schoolarship_id || ''
      });
      setPersonalForm({
        student_code: data.student_code || '',
        std_eng_name: data.std_eng_name || '',
        std_khmer_name: data.std_khmer_name || '',
        gender: data.gender || '0',
        dob: data.dob ? data.dob.split('T')[0] : '',
        phone: data.phone || '',
        nationality: data.nationality || 'Cambodian',
        race: data.race || 'Khmer',
        marital_status: data.marital_status || '0'
      });
      setAddressForm({
        province_no: data.province_no || '',
        district_no: data.district_no || '',
        commune_no: data.commune_no || '',
        village_no: data.village_no || ''
      });
      setParentAccountForm({
        parent_id: data.parent_id || '',
        username: data.username || '',
        email: data.email || '',
        status: data.status !== undefined ? String(data.status) : '1'
      });
    } catch (err) {
      console.error('Error loading student:', err);
      setError(err.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicData = async () => {
    try {
      const [deptData, statusData, scholarshipData] = await Promise.all([
        api.getDepartments(),
        api.getStudentStatuses(),
        api.getScholarships()
      ]);
      setDepartments(deptData);
      setStatuses(statusData);
      setScholarships(scholarshipData);
      
      // Load programs if department exists
      if (academicForm.department_id) {
        const programData = await api.getProgramsByDepartment(academicForm.department_id);
        setPrograms(programData);
        
        // Load batches if program exists
        if (academicForm.program_id) {
          const batchData = await api.getBatchesByProgram(academicForm.program_id);
          setBatches(batchData);
        }
      }
    } catch (err) {
      console.error('Error loading academic data:', err);
    }
  };

  const handleAcademicDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setAcademicForm({ ...academicForm, department_id: departmentId, program_id: '', batch_id: '' });
    setPrograms([]);
    setBatches([]);
    
    if (departmentId) {
      try {
        const programData = await api.getProgramsByDepartment(departmentId);
        setPrograms(programData);
      } catch (err) {
        console.error('Error loading programs:', err);
      }
    }
  };

  const handleAcademicProgramChange = async (e) => {
    const programId = e.target.value;
    setAcademicForm({ ...academicForm, program_id: programId, batch_id: '' });
    setBatches([]);
    
    if (programId) {
      try {
        const batchData = await api.getBatchesByProgram(programId);
        setBatches(batchData);
      } catch (err) {
        console.error('Error loading batches:', err);
      }
    }
  };

  const handleAcademicSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const oldDepartmentId = student.department_id;
      const newDepartmentId = academicForm.department_id;
  console.log('=== ACADEMIC FORM SUBMIT ===');
  console.log('Full form data:', academicForm);
  console.log('schoolarship_id:', academicForm.schoolarship_id, 'Type:', typeof academicForm.schoolarship_id);
      
      
      // Update student academic info
      await api.updateStudent(id, academicForm);
      
      // If department changed, record in department_change table
      if (oldDepartmentId && newDepartmentId && oldDepartmentId !== newDepartmentId) {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/department-changes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            student_id: id,
            old_department_id: oldDepartmentId,
            new_department_id: newDepartmentId,
            change_date: new Date().toISOString().split('T')[0]
          })
        });
      }
      
      setSuccess('✓ Academic information updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowAcademicEditModal(false);
      loadStudentDetails();
    } catch (err) {
      console.error('Error updating academic info:', err);
      setError('❌ ' + (err.message || 'Failed to update academic information'));
    }
  };

  // Personal Info handlers
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudent(id, personalForm);
      setSuccess('✅ Personal information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowPersonalEditModal(false);
      loadStudentDetails();
    } catch (err) {
      console.error('Error updating personal info:', err);
      setError('❌ ' + (err.message || 'Failed to update personal information'));
    }
  };

  // Address Info handlers
  const loadAddressData = async () => {
    try {
      console.log('Loading address data - Starting fresh (no pre-selection)');
      
      // Reset form - start fresh for new selection
      setAddressForm({
        province_no: '',
        district_no: '',
        commune_no: '',
        village_no: ''
      });

      // Reset all cascaded dropdowns
      setDistricts([]);
      setCommunes([]);
      setVillages([]);

      // Load all provinces
      console.log('Fetching all provinces...');
      const provincesData = await api.getProvinces();
      console.log('Provinces loaded:', provincesData?.length || 0);
      
      if (provincesData && Array.isArray(provincesData)) {
        setProvinces(provincesData);
      } else {
        console.error('Invalid provinces data');
        setProvinces([]);
        setError('❌ Failed to load provinces');
      }
    } catch (err) {
      console.error('Error loading address data:', err);
      setError('❌ Failed to load address data: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleAddressProvinceChange = async (provinceNo) => {
    setAddressForm({ ...addressForm, province_no: provinceNo, district_no: '', commune_no: '', village_no: '' });
    setDistricts([]);
    setCommunes([]);
    setVillages([]);
    if (provinceNo) {
      try {
        const districtsData = await api.getDistricts(provinceNo);
        setDistricts(districtsData);
      } catch (err) {
        console.error('Error loading districts:', err);
      }
    }
  };

  const handleAddressDistrictChange = async (districtNo) => {
    setAddressForm({ ...addressForm, district_no: districtNo, commune_no: '', village_no: '' });
    setCommunes([]);
    setVillages([]);
    if (districtNo) {
      try {
        const communesData = await api.getCommunes(districtNo);
        setCommunes(communesData);
      } catch (err) {
        console.error('Error loading communes:', err);
      }
    }
  };

  const handleAddressCommuneChange = async (communeNo) => {
    setAddressForm({ ...addressForm, commune_no: communeNo, village_no: '' });
    setVillages([]);
    if (communeNo) {
      try {
        const villagesData = await api.getVillages(communeNo);
        setVillages(villagesData);
      } catch (err) {
        console.error('Error loading villages:', err);
      }
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudent(id, addressForm);
      setSuccess('✅ Address information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowAddressEditModal(false);
      loadStudentDetails();
    } catch (err) {
      console.error('Error updating address info:', err);
      setError('❌ ' + (err.message || 'Failed to update address information'));
    }
  };

  // Parent & Account handlers
  const loadParentAccountData = async () => {
    try {
      // Pre-fill form with current student data
      setParentAccountForm({
        parent_id: student.parent_id || '',
        username: student.username || '',
        email: student.email || ''
      });

      const parentsData = await api.getParents();
      setParents(parentsData);
    } catch (err) {
      console.error('Error loading parents:', err);
    }
  };

  // User handlers
  const loadUserData = async () => {
    // Pre-fill with current values
    console.log('Loading user data for edit modal...');
    console.log('student.username:', student.username);
    console.log('student.email:', student.email);
    console.log('student.status:', student.status, 'Type:', typeof student.status);
    
    const statusValue = student.status !== undefined && student.status !== '' && student.status !== null 
      ? String(student.status) 
      : '1';
    
    console.log('Setting status to:', statusValue);
    
    setParentAccountForm(prev => ({
      ...prev,
      username: student.username || '',
      email: student.email || '',
      status: statusValue
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: parentAccountForm.username,
        email: parentAccountForm.email,
        status: Number(parentAccountForm.status)
      };
      console.log('Submitting user update payload:', payload);
      console.log('Status value:', payload.status, 'Type:', typeof payload.status);
      await api.updateStudent(id, payload);
      setSuccess('✅ User information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowUserEditModal(false);
      loadStudentDetails();
    } catch (err) {
      console.error('Error updating user info:', err);
      setError('❌ ' + (err.message || 'Failed to update user information'));
    }
  };

  const handleParentAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only update parent_id
      const payload = {
        parent_id: parentAccountForm.parent_id
      };
      await api.updateStudent(id, payload);
      setSuccess('✅ Parent information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowParentAccountEditModal(false);
      loadStudentDetails();
    } catch (err) {
      console.error('Error updating parent info:', err);
      setError('❌ ' + (err.message || 'Failed to update parent information'));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploading(true);

      // Compress and convert image to base64
      const compressedBase64 = await compressImage(file, 800, 800, 0.8);

      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/students/${id}/upload-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageData: compressedBase64 })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setSuccess('✓ Profile image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload student details to get updated image
      loadStudentDetails();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('❌ ' + (err.message || 'Failed to upload image'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  // Function to compress image before upload
  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading student details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#dc2626' }}>
            {error || 'Student not found'}
          </div>
          <button 
            onClick={() => window.location.href = '/students'}
            style={{ 
              marginTop: 20,
              background: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              padding: '10px 24px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            Back to Students
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '0 40px' }}>
      {/* Error Message */}
      {error && (
        <div style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#fee2e2',
          border: '2px solid #fca5a5',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#dc2626',
          fontWeight: 600,
          fontSize: '0.95rem',
          zIndex: 2000,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
          maxWidth: '400px'
        }}>
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#dcfce7',
          border: '2px solid #86efac',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#16a34a',
          fontWeight: 600,
          fontSize: '0.95rem',
          zIndex: 2000,
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
          maxWidth: '400px'
        }}>
          {success}
        </div>
      )}

      {/* Uploading Overlay */}
      {uploading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: 30,
            borderRadius: 12,
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#1f2937'
          }}>
            Uploading image...
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 30
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            color: '#1f2937',
            margin: 0,
            marginBottom: 8
          }}>
            Student Profile
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#64748b',
            margin: 0
          }}>
            View detailed information about {student.std_eng_name}
          </p>
        </div>
        <div>
          <button 
            onClick={() => window.location.href = '/students'}
            style={{ 
              background: '#6b7280', 
              color: 'white', 
              border: 'none', 
              padding: '10px 24px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              display: isStudent ? 'none' : 'flex'
            }}
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        boxShadow: '0 4px 20px rgba(0,0,0,.08)',
        overflow: 'hidden'
      }}>
        {/* Header Section with Gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 40,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 24
          }}>
            {/* Profile Image */}
            <div style={{ position: 'relative' }}>
              {student.profile_image ? (
                <img 
                  src={student.profile_image}
                  alt={student.std_eng_name}
                  onError={(e) => {
                    console.error('Image failed to load');
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  style={{ 
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 8px 32px rgba(0,0,0,.2)',
                    border: '4px solid white'
                  }}
                />
              ) : null}
              <div style={{ 
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'white',
                display: student.profile_image ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                color: '#667eea',
                boxShadow: '0 8px 32px rgba(0,0,0,.2)'
              }}>
                👤
              </div>
              {!isStudent && (
                <>
                  <input 
                    type="file"
                    id="profileImageInput"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => document.getElementById('profileImageInput').click()}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'white',
                      border: '2px solid #667eea',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,.2)'
                    }}
                    title="Upload profile image"
                  >
                    📷
                  </button>
                </>
              )}
            </div>
            
            {/* Student Basic Info */}
            <div>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 900, 
                color: 'white',
                margin: 0,
                marginBottom: 8,
                textShadow: '0 2px 8px rgba(0,0,0,.2)'
              }}>
                {student.std_eng_name}
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                marginBottom: 4
              }}>
                {student.std_khmer_name}
              </p>
              <div style={{ 
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'white',
                marginTop: 8
              }}>
                Student Code: {student.student_code}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ padding: 40 }}>
          {/* Personal Information */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: '#1f2937',
                margin: 0,
                paddingBottom: 12,
                borderBottom: '3px solid #667eea',
                display: 'inline-block'
              }}>
                👤 Personal Information
              </h3>
              {!isStudent && (
                <button
                  onClick={() => setShowPersonalEditModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 600
                  }}
                >
                  <span>✏️</span>
                  Edit Personal Info
                </button>
              )}
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 24,
              marginTop: 20
            }}>
              <InfoItem label="Student Code" value={student.student_code || 'N/A'} />
              <InfoItem label="English Name" value={student.std_eng_name || 'N/A'} />
              <InfoItem label="Khmer Name" value={student.std_khmer_name || 'N/A'} />
              <InfoItem label="Gender" value={student.gender === '1' ? 'Female' : 'Male'} />
              <InfoItem label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'} />
              <InfoItem label="Phone" value={student.phone || 'N/A'} />
              <InfoItem label="Nationality" value={student.nationality || 'N/A'} />
              <InfoItem label="Race" value={student.race || 'N/A'} />
              <InfoItem label="Marital Status" value={student.marital_status === '1' ? 'Married' : 'Single'} />
            </div>
          </section>

          {/* Academic Information */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: '#1f2937',
                paddingBottom: 12,
                borderBottom: '3px solid #10b981',
                display: 'inline-block',
                margin: 0
              }}>
                🎓 Academic Information
              </h3>
              {!isStudent && (
                <button
                  onClick={() => {
                    setShowAcademicEditModal(true);
                    loadAcademicData();
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  ✏️ Edit Academic Info
                </button>
              )}
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 24,
              marginTop: 20
            }}>
              <InfoItem label="Department" value={student.department_name || 'N/A'} />
              <InfoItem label="Program" value={student.program_name || 'N/A'} />
              <InfoItem label="Batch" value={student.batch_code ? `${student.batch_code} (${student.academic_year || ''})` : 'N/A'} />
              <InfoItem label="From High School" value={student.from_high_school || 'N/A'} />
              <InfoItem label="Student Status" value={student.status_name || 'N/A'} />
              <InfoItem label="Scholarship" value={student.scholarship_name || 'No Scholarship'} />
            </div>
          </section>

          {/* Address Information */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: '#1f2937',
                margin: 0,
                paddingBottom: 12,
                borderBottom: '3px solid #f59e0b',
                display: 'inline-block'
              }}>
                🏠 Address Information
              </h3>
              {!isStudent && (
                <button
                  onClick={async () => { 
                    await loadAddressData(); 
                    setShowAddressEditModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#f39c12',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 600
                  }}
                >
                  <span>✏️</span>
                  Edit Address
                </button>
              )}
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 24,
              marginTop: 20
            }}>
              <InfoItem label="Province" value={student.province_name || 'N/A'} />
              <InfoItem label="District" value={student.district_name || 'N/A'} />
              <InfoItem label="Commune" value={student.commune_name || 'N/A'} />
              <InfoItem label="Village" value={student.village_name || 'N/A'} />
            </div>
          </section>

             {/* Parent Information */}
             <section style={{ marginBottom: 40 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                 <h3 style={{ 
                   fontSize: '1.3rem', 
                   fontWeight: 700, 
                   color: '#1f2937',
                   margin: 0,
                   paddingBottom: 12,
                   borderBottom: '3px solid #ec4899',
                   display: 'inline-block'
                 }}>
                   👨‍👩‍👧 Parent Information
                 </h3>
                 {!isStudent && (
                   <button
                     onClick={async () => { 
                       await loadParentAccountData(); 
                       setShowParentAccountEditModal(true);
                     }}
                     style={{
                       padding: '8px 16px',
                       background: '#e91e63',
                       color: 'white',
                       border: 'none',
                       borderRadius: '5px',
                       cursor: 'pointer',
                       fontSize: '14px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '5px',
                       fontWeight: 600
                     }}
                   >
                     <span>✏️</span>
                     Edit Parent
                   </button>
                 )}
               </div>
               <div style={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(3, 1fr)', 
                 gap: 24,
                 marginTop: 20
               }}>
                 <InfoItem label="Parent Code" value={student.parent_code || 'N/A'} />
                 <InfoItem label="Father Name" value={student.father_name || 'N/A'} />
                 <InfoItem label="Mother Name" value={student.mother_name || 'N/A'} />
                 <InfoItem label="Father Occupation" value={student.father_occupation || 'N/A'} />
                 <InfoItem label="Mother Occupation" value={student.mother_occupation || 'N/A'} />
                 <InfoItem label="Father Phone" value={student.father_phone || 'N/A'} />
                 <InfoItem label="Mother Phone" value={student.mother_phone || 'N/A'} />
               </div>
             </section>
 
             {/* User Information */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 700, 
                  color: '#1f2937',
                  margin: 0,
                  paddingBottom: 12,
                  borderBottom: '3px solid #6366f1',
                  display: 'inline-block'
                }}>
                  👤 User Information
                </h3>
                {!isStudent && (
                  <button
                    onClick={async () => { await loadUserData(); setShowUserEditModal(true); }}
                    style={{
                      padding: '8px 16px',
                      background: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600
                    }}
                  >
                    <span>✏️</span>
                    Edit User
                  </button>
                )}
              </div>
               <div style={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(3, 1fr)', 
                 gap: 24,
                 marginTop: 20
               }}>
                 <InfoItem label="Username" value={student.username || 'N/A'} />
                 <InfoItem label="Email" value={student.email || 'N/A'} />
                 <InfoItem 
                   label="Status" 
                   value={
                    <span style={{
                       padding: '4px 12px',
                       borderRadius: '12px',
                       fontSize: '0.85rem',
                       fontWeight: 600,
                      background: Number(student.status) === 1 ? '#d1fae5' : '#fee2e2',
                      color: Number(student.status) === 1 ? '#065f46' : '#991b1b'
                     }}>
                      {Number(student.status) === 1 ? '✓ Active' : '✗ Inactive'}
                     </span>
                   } 
                 />
                 <InfoItem label="Created At" value={student.created_at ? new Date(student.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'} />
               </div>
             </section>

          {/* Description */}
          {student.description && (
            <section style={{ marginTop: 40 }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: '#1f2937',
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: '3px solid #8b5cf6',
                display: 'inline-block'
              }}>
                📝 Description
              </h3>
              <div style={{ 
                marginTop: 20,
                padding: 20,
                background: '#f9fafb',
                borderRadius: 8,
                fontSize: '0.95rem',
                color: '#374151',
                lineHeight: 1.6
              }}>
                {student.description}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && <EditStudentModal student={student} onClose={() => setShowEditModal(false)} onSuccess={() => { loadStudentDetails(); setShowEditModal(false); setSuccess('✓ Student updated successfully!'); setTimeout(() => setSuccess(''), 3000); }} />}

      {/* Academic Edit Modal */}
      {showAcademicEditModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>Edit Academic Information</h2>
              <p>Update student's academic details</p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleAcademicSubmit} id="academicForm">
                <div className="form-section">
                  <div className="form-grid-vertical">
                    <div className="form-field">
                      <label className="form-label">Department <span className="required">*</span></label>
                      <select 
                        name="department_id" 
                        value={academicForm.department_id} 
                        onChange={handleAcademicDepartmentChange} 
                        required 
                        className="form-select"
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Program <span className="required">*</span></label>
                      <select 
                        name="program_id" 
                        value={academicForm.program_id} 
                        onChange={handleAcademicProgramChange} 
                        disabled={!academicForm.department_id} 
                        required 
                        className="form-select"
                      >
                        <option value="">Select Program</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Batch</label>
                      <select 
                        name="batch_id" 
                        value={academicForm.batch_id} 
                        onChange={(e) => setAcademicForm({...academicForm, batch_id: e.target.value})}
                        disabled={!academicForm.program_id} 
                        className="form-select"
                      >
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.Id} value={b.Id}>{b.batch_code} ({b.academic_year})</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">From High School <span className="required">*</span></label>
                      <input 
                        name="from_high_school" 
                        value={academicForm.from_high_school} 
                        onChange={(e) => setAcademicForm({...academicForm, from_high_school: e.target.value})}
                        required 
                        className="form-input" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Status</label>
                      <select 
                        name="std_status_id" 
                        value={academicForm.std_status_id} 
                        onChange={(e) => setAcademicForm({...academicForm, std_status_id: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select Status</option>
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.std_status}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Scholarship</label>
                      <select 
                        name="schoolarship_id" 
                        value={academicForm.schoolarship_id} 
                        onChange={(e) => setAcademicForm({...academicForm, schoolarship_id: e.target.value})}
                        className="form-select"
                      >
                        <option value="">No Scholarship</option>
                        {scholarships.map(s => <option key={s.id} value={s.id}>{s.scholarship}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={() => setShowAcademicEditModal(false)} className="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" form="academicForm" className="btn btn-submit">
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Edit Modal */}
      {showPersonalEditModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Edit Personal Information</h2>
              <p>Update student's personal details</p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handlePersonalSubmit} id="personalForm">
                <div className="form-section">
                  <div className="form-grid-vertical">
                    <div className="form-field">
                      <label className="form-label">Student Code <span className="required">*</span></label>
                      <input 
                        type="text"
                        name="student_code" 
                        value={personalForm.student_code} 
                        onChange={(e) => setPersonalForm({...personalForm, student_code: e.target.value})}
                        required 
                        className="form-input"
                        placeholder="Enter student code"
                        readOnly={!isAdmin}
                        style={{ 
                          background: isAdmin ? '#fff' : '#f3f4f6',
                          cursor: isAdmin ? 'text' : 'not-allowed'
                        }}
                        title={isAdmin ? '' : 'Only admin can edit student code'}
                      />
                      {!isAdmin && (
                        <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          ℹ️ Only admin can edit student code
                        </small>
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">English Name <span className="required">*</span></label>
                      <input 
                        type="text"
                        name="std_eng_name" 
                        value={personalForm.std_eng_name} 
                        onChange={(e) => setPersonalForm({...personalForm, std_eng_name: e.target.value})}
                        required 
                        className="form-input"
                        placeholder="Enter student's English name"
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Khmer Name</label>
                      <input 
                        type="text"
                        name="std_khmer_name" 
                        value={personalForm.std_khmer_name} 
                        onChange={(e) => setPersonalForm({...personalForm, std_khmer_name: e.target.value})}
                        className="form-input"
                        placeholder="Enter student's Khmer name"
                        style={{ pointerEvents: 'auto', userSelect: 'text' }}
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Gender <span className="required">*</span></label>
                      <select 
                        name="gender" 
                        value={personalForm.gender} 
                        onChange={(e) => setPersonalForm({...personalForm, gender: e.target.value})}
                        required 
                        className="form-select"
                      >
                        <option value="0">Male</option>
                        <option value="1">Female</option>
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Date of Birth <span className="required">*</span></label>
                      <input 
                        type="date"
                        name="dob" 
                        value={personalForm.dob} 
                        onChange={(e) => setPersonalForm({...personalForm, dob: e.target.value})}
                        required 
                        className="form-input" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Phone</label>
                      <input 
                        name="phone" 
                        value={personalForm.phone} 
                        onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})}
                        className="form-input" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Nationality</label>
                      <input 
                        name="nationality" 
                        value={personalForm.nationality} 
                        onChange={(e) => setPersonalForm({...personalForm, nationality: e.target.value})}
                        className="form-input" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Race</label>
                      <input 
                        name="race" 
                        value={personalForm.race} 
                        onChange={(e) => setPersonalForm({...personalForm, race: e.target.value})}
                        className="form-input" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Marital Status</label>
                      <select 
                        name="marital_status" 
                        value={personalForm.marital_status} 
                        onChange={(e) => setPersonalForm({...personalForm, marital_status: e.target.value})}
                        className="form-select"
                      >
                        <option value="0">Single</option>
                        <option value="1">Married</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={() => setShowPersonalEditModal(false)} className="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" form="personalForm" className="btn btn-submit">
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {showAddressEditModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Edit Address Information</h2>
              <p>Update student's address details</p>
            </div>
            
            <div className="modal-body">
              {/* Debug info */}
              <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '10px', fontSize: '12px', display: 'none' }}>
                <strong>Debug:</strong> Provinces count: {provinces.length} | 
                Districts: {districts.length} | 
                Communes: {communes.length} | 
                Villages: {villages.length}
              </div>
              
              <form onSubmit={handleAddressSubmit} id="addressForm">
                <div className="form-section">
                  <div className="form-grid-vertical">
                    <div className="form-field">
                      <label className="form-label">Province <span className="required">*</span></label>
                      <select 
                        name="province_no" 
                        value={addressForm.province_no} 
                        onChange={(e) => handleAddressProvinceChange(e.target.value)}
                        required 
                        className="form-select"
                      >
                        <option value="">Select Province ({provinces.length} available)</option>
                        {provinces.map(p => <option key={p.province_no} value={p.province_no}>{p.province_name}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">District <span className="required">*</span></label>
                      <select 
                        name="district_no" 
                        value={addressForm.district_no} 
                        onChange={(e) => handleAddressDistrictChange(e.target.value)}
                        disabled={!addressForm.province_no}
                        required 
                        className="form-select"
                      >
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d.district_no} value={d.district_no}>{d.district_name}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Commune <span className="required">*</span></label>
                      <select 
                        name="commune_no" 
                        value={addressForm.commune_no} 
                        onChange={(e) => handleAddressCommuneChange(e.target.value)}
                        disabled={!addressForm.district_no}
                        required 
                        className="form-select"
                      >
                        <option value="">Select Commune</option>
                        {communes.map(c => <option key={c.commune_no} value={c.commune_no}>{c.commune_name}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">Village <span className="required">*</span></label>
                      <select 
                        name="village_no" 
                        value={addressForm.village_no} 
                        onChange={(e) => setAddressForm({...addressForm, village_no: e.target.value})}
                        disabled={!addressForm.commune_no}
                        required 
                        className="form-select"
                      >
                        <option value="">Select Village</option>
                        {villages.map(v => <option key={v.village_no} value={v.village_no}>{v.village_name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={() => setShowAddressEditModal(false)} className="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" form="addressForm" className="btn btn-submit">
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Edit Modal */}
      {showParentAccountEditModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Edit Parent Information</h2>
              <p>Select parent for this student</p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleParentAccountSubmit} id="parentAccountForm">
                <div className="form-section">
                  <div className="form-grid-vertical">
                    <div className="form-field">
                      <label className="form-label">Parent <span className="required">*</span></label>
                      <select 
                        name="parent_id" 
                        value={parentAccountForm.parent_id} 
                        onChange={(e) => setParentAccountForm({...parentAccountForm, parent_id: e.target.value})}
                        required
                        className="form-select"
                      >
                        <option value="">Select Parent</option>
                        {parents.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.parent_code} - Father: {p.father_name} | Mother: {p.mother_name}
                          </option>
                        ))}
                      </select>
                      <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Choose the parent record to link with this student
                      </small>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={() => setShowParentAccountEditModal(false)} className="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" form="parentAccountForm" className="btn btn-submit">
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* User Edit Modal */}
      {showUserEditModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Edit User Information</h2>
              <p>Update login and account status</p>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUserSubmit} id="userForm">
                <div className="form-section">
                  <div className="form-grid-vertical">
                    <div className="form-field">
                      <label className="form-label">Username <span className="required">*</span></label>
                      <input 
                        name="username"
                        value={parentAccountForm.username}
                        onChange={(e) => setParentAccountForm({...parentAccountForm, username: e.target.value})}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Email</label>
                      <input 
                        type="email"
                        name="email"
                        value={parentAccountForm.email}
                        onChange={(e) => setParentAccountForm({...parentAccountForm, email: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        value={parentAccountForm.status}
                        onChange={(e) => setParentAccountForm({...parentAccountForm, status: e.target.value})}
                        className="form-select"
                      >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowUserEditModal(false)} className="btn btn-cancel">Cancel</button>
              <button type="submit" form="userForm" className="btn btn-submit">✓ Save Changes</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}

// Edit Student Modal Component
function EditStudentModal({ student, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    std_eng_name: student.std_eng_name || '',
    std_khmer_name: student.std_khmer_name || '',
    student_code: student.student_code || '',
    gender: student.gender || '0',
    dob: student.dob ? student.dob.split('T')[0] : '',
    phone: student.phone || '',
    nationality: student.nationality || '',
    race: student.race || '',
    marital_status: student.marital_status || '0',
    department_id: student.department_id || '',
    program_id: student.program_id || '',
    batch_id: student.batch_id || '',
    from_high_school: student.from_high_school || '',
    std_status_id: student.std_status_id || '',
    schoolarship_id: student.schoolarship_id || '',
    province_no: student.province_no || '',
    district_no: student.district_no || '',
    commune_no: student.commune_no || '',
    village_no: student.village_no || '',
    description: student.description || '',
    username: student.username || '',
    email: student.email || '',
    status: student.status || '1'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update student');
      }

      onSuccess();
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Student Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ 
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '12px 16px',
                color: '#dc2626',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {/* Account Status */}
            <div className="form-section">
              <h3 className="section-title">Account Status</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">English Name *</label>
                  <input
                    type="text"
                    name="std_eng_name"
                    value={formData.std_eng_name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Khmer Name *</label>
                  <input
                    type="text"
                    name="std_khmer_name"
                    value={formData.std_khmer_name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Code *</label>
                  <input
                    type="text"
                    name="student_code"
                    value={formData.student_code}
                    onChange={handleChange}
                    className="form-input"
                    required
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select 
                    name="gender" 
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="0">Male</option>
                    <option value="1">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Race</label>
                  <input
                    type="text"
                    name="race"
                    value={formData.race}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Marital Status</label>
                  <select 
                    name="marital_status" 
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="0">Single</option>
                    <option value="1">Married</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="form-section">
              <h3 className="section-title">Account Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    required
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-section">
              <h3 className="section-title">Description</h3>
              <div className="form-group">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                  placeholder="Additional notes..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ label, value }) {
  return (
    <div style={{ 
      padding: 16,
      background: '#f9fafb',
      borderRadius: 8,
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 6
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '1rem', 
        fontWeight: 600, 
        color: '#1f2937'
      }}>
        {value}
      </div>
    </div>
  );
}

export default StudentProfile;
