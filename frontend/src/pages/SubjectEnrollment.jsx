import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

export default function SubjectEnrollment() {
  const { showSuccess } = useAlert();
  const [enrollments, setEnrollments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [statuses, setStatuses] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [form, setForm] = useState({
    program_id: '',
    subject_id: '',
    teacher_id: '',
    batch_id: '',
    semester: '1',
    status: '',
    start_date: '',
    end_date: ''
  });

  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Starting to load data...');
      
      const [enrollData, progData, subjData, teachData, batchData, statusData] = await Promise.all([
        api.getSubjectEnrollments().catch(e => { console.error('❌ Enrollments error:', e.message); return []; }),
        api.getPrograms().catch(e => { console.error('❌ Programs error:', e.message); return []; }),
        api.getSubjects().catch(e => { console.error('❌ Subjects error:', e.message); return []; }),
        api.getTeachers().catch(e => { console.error('❌ Teachers error:', e.message); return []; }),
        api.getBatches().catch(e => { console.error('❌ Batches error:', e.message); return []; }),
        api.getEnrollmentStatuses().catch(e => { console.error('❌ Statuses error:', e.message); return []; })
      ]);
      
      console.log('✅ Enrollments loaded:', enrollData?.length || 0);
      if (enrollData?.length > 0) console.log('First enrollment:', enrollData[0]);
      
      console.log('✅ Programs loaded:', progData?.length || 0);
      console.log('✅ Subjects loaded:', subjData?.length || 0);
      console.log('✅ Teachers loaded:', teachData?.length || 0);
      console.log('✅ Batches loaded:', batchData?.length || 0);
      console.log('✅ Statuses loaded:', statusData?.length || 0);
      
      setEnrollments(enrollData || []);
      setPrograms(progData || []);
      setSubjects(subjData || []);
      setTeachers(teachData || []);
      setBatches(batchData || []);
      setStatuses(statusData || []);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // When program changes, filter subjects by program_id
    if (name === 'program_id') {
      const programSubjects = subjects.filter(s => s.program_id === parseInt(value));
      setFilteredSubjects(programSubjects);
      setForm(prev => ({ ...prev, [name]: value, subject_id: '' })); // Reset subject selection
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.updateSubjectEnrollment(editingId, form);
        showSuccess('Subject enrollment updated successfully');
      } else {
        await api.createSubjectEnrollment(form);
        showSuccess('Subject enrollment created successfully');
      }
      
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (enrollment) => {
    setEditingId(enrollment.id);
    setForm({
      program_id: enrollment.program_id,
      subject_id: enrollment.subject_id,
      teacher_id: enrollment.teacher_id,
      batch_id: enrollment.batch_id,
      semester: enrollment.semester,
      status: enrollment.status,
      start_date: enrollment.start_date,
      end_date: enrollment.end_date
    });
    
    // Filter subjects for the selected program
    const programSubjects = subjects.filter(s => s.program_id === enrollment.program_id);
    setFilteredSubjects(programSubjects);
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      await api.deleteSubjectEnrollment(id);
      showSuccess('Subject enrollment deleted successfully');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFilteredSubjects([]);
    setForm({
      program_id: '',
      subject_id: '',
      teacher_id: '',
      batch_id: '',
      semester: '1',
      status: '',
      start_date: '',
      end_date: ''
    });
  };

  const filteredEnrollments = enrollments.filter(e => {
    const query = searchQuery.toLowerCase();
    return (
      e.program_name?.toLowerCase().includes(query) ||
      e.subject_name?.toLowerCase().includes(query) ||
      e.teacher_name?.toLowerCase().includes(query) ||
      e.batch_code?.toLowerCase().includes(query) ||
      e.department_name?.toLowerCase().includes(query)
    );
  });

  if (loading) return <DashboardLayout><div className="loader">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Subject Assign</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>Manage subject assignments for programs</p>
          </div>
          <button className="btn" onClick={() => setShowModal(true)} style={{ width: '140px', height: '36px', padding: '0' }}>
            + Add Assignment
          </button>
        </div>

        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Search Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            padding: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span> Subject Assignments List
              </h3>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
                {filteredEnrollments.length} assignments
              </span>
            </div>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.1rem'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search assignments..."
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
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', width: '60px' }}>No.</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Program</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Subject</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Teacher</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Batch</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Semester</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Start Date</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>End Date</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.slice(0, entriesPerPage).map((enrollment, index) => (
                  <tr 
                    key={enrollment.id}
                    style={{ 
                      borderBottom: index < filteredEnrollments.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ 
                      padding: '16px 20px', 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280'
                    }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{enrollment.program_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{enrollment.department_name}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{enrollment.subject_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{enrollment.subject_name}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>{enrollment.teacher_name}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{enrollment.batch_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{enrollment.academic_year}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563', fontWeight: '600' }}>Semester {enrollment.semester}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                      <span style={{
                        background: enrollment.status === 1 ? '#dcfce7' : '#fee2e2',
                        color: enrollment.status === 1 ? '#166534' : '#991b1b',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {enrollment.status_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>{new Date(enrollment.start_date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>{new Date(enrollment.end_date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleEdit(enrollment)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                          onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(enrollment.id)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                          }}
                          onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEnrollments.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ 
                      textAlign: 'center', 
                      padding: '48px 20px', 
                      color: '#6b7280',
                      fontSize: '1rem'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '2rem' }}>📋</span>
                        No assignments found. Create your first assignment above!
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal" style={{maxWidth:600}} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingId ? 'Edit Assignment' : 'Add Assignment'}</h3>
                <button className="close" onClick={handleCloseModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                    <div className="form-field">
                      <label>Program *</label>
                      <select name="program_id" value={form.program_id} onChange={handleChange} required>
                        <option value="">Select Program</option>
                        {programs && programs.length > 0 ? (
                          programs.map(p => (
                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                          ))
                        ) : (
                          <option disabled>Loading programs...</option>
                        )}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Subject *</label>
                      <select name="subject_id" value={form.subject_id} onChange={handleChange} required disabled={!form.program_id}>
                        <option value="">{form.program_id ? 'Select Subject' : 'Select Program First'}</option>
                        {filteredSubjects && filteredSubjects.length > 0 ? (
                          filteredSubjects.map(s => (
                            <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                          ))
                        ) : form.program_id ? (
                          <option disabled>No subjects for this program</option>
                        ) : null}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Teacher *</label>
                      <select name="teacher_id" value={form.teacher_id} onChange={handleChange} required>
                        <option value="">Select Teacher</option>
                        {teachers && teachers.length > 0 ? (
                          teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.eng_name}</option>
                          ))
                        ) : (
                          <option disabled>Loading teachers...</option>
                        )}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Batch *</label>
                      <select name="batch_id" value={form.batch_id} onChange={handleChange} required>
                        <option value="">Select Batch</option>
                        {batches && batches.length > 0 ? (
                          batches.map(b => (
                            <option key={b.Id} value={b.Id}>{b.batch_code} ({b.academic_year})</option>
                          ))
                        ) : (
                          <option disabled>Loading batches...</option>
                        )}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Semester *</label>
                      <select name="semester" value={form.semester} onChange={handleChange} required>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Status *</label>
                      <select name="status" value={form.status} onChange={handleChange} required>
                        <option value="">Select Status</option>
                        {statuses && statuses.length > 0 ? (
                          statuses.map(s => (
                            <option key={s.id} value={s.id}>{s.status_name}</option>
                          ))
                        ) : (
                          <option disabled>Loading statuses...</option>
                        )}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Start Date *</label>
                      <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
                    </div>

                    <div className="form-field">
                      <label>End Date *</label>
                      <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-submit">
                    {editingId ? 'Update' : 'Create'} Enrollment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
