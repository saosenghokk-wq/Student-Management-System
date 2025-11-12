import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/table.css';

export default function SubjectEnrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    setSuccess('');

    try {
      if (editingId) {
        await api.updateSubjectEnrollment(editingId, form);
        setSuccess('Subject enrollment updated successfully');
      } else {
        await api.createSubjectEnrollment(form);
        setSuccess('Subject enrollment created successfully');
      }
      
      await loadData();
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
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
      setSuccess('Subject enrollment deleted successfully');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
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
            <h1>Subject Enrollment</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>Manage subject enrollments for programs</p>
          </div>
          <button className="btn" onClick={() => setShowModal(true)} style={{ width: '140px', height: '36px', padding: '0' }}>
            + Add Enrollment
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {/* Search */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="page-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search by program, subject, teacher..."
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
            <span style={{fontSize:'1.2rem'}}>📊</span>
            Showing <strong>{filteredEnrollments.length}</strong> of <strong>{enrollments.length}</strong> enrollments
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Batch</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      <div style={{fontWeight:600}}>{enrollment.program_code}</div>
                      <div style={{fontSize:'.75rem',color:'#64748b'}}>{enrollment.department_name}</div>
                    </td>
                    <td>
                      <div style={{fontWeight:600}}>{enrollment.subject_code}</div>
                      <div style={{fontSize:'.75rem',color:'#64748b'}}>{enrollment.subject_name}</div>
                    </td>
                    <td>{enrollment.teacher_name}</td>
                    <td>
                      <div style={{fontWeight:600}}>{enrollment.batch_code}</div>
                      <div style={{fontSize:'.75rem',color:'#64748b'}}>{enrollment.academic_year}</div>
                    </td>
                    <td>Semester {enrollment.semester}</td>
                    <td>
                      <span className={`badge ${enrollment.status === 1 ? 'success' : 'danger'}`}>
                        {enrollment.status_name}
                      </span>
                    </td>
                    <td>{new Date(enrollment.start_date).toLocaleDateString()}</td>
                    <td>{new Date(enrollment.end_date).toLocaleDateString()}</td>
                    <td style={{textAlign:'center'}}>
                      <button className="btn btn-sm" onClick={() => handleEdit(enrollment)} style={{marginRight:4}}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-cancel" onClick={() => handleDelete(enrollment.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEnrollments.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{textAlign:'center',padding:'40px',color:'#64748b'}}>
                      No enrollments found
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
                <h3>{editingId ? 'Edit Enrollment' : 'Add Enrollment'}</h3>
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
