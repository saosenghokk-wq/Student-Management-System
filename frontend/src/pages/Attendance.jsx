import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Attendance() {
  const { showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjectEnrollments, setSubjectEnrollments] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  
  // Selected class
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Students in selected class with their attendance
  const [classStudents, setClassStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({});
  
  // Sub-view mode when class is selected: 'add' or 'history'
  const [subView, setSubView] = useState('add');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, statusRes] = await Promise.all([
        api.getAttendanceSubjectEnrollments(),
        api.getAttendanceStatusTypes()
      ]);
      
      setSubjectEnrollments(enrollmentsRes.data || []);
      setStatusTypes(statusRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadClassStudents = useCallback(async () => {
    if (!selectedEnrollment) return;
    
    try {
      setLoading(true);
      const response = await api.getStudentsByBatch(selectedEnrollment.batch_id);
      const students = response.data || [];
      
      // Load existing attendance for this date
      const attendanceRes = await api.getAttendanceByClassAndDate(
        selectedEnrollment.id,
        attendanceDate
      );
      const existingAttendance = attendanceRes.data || [];
      
      // Initialize attendance state
      const attendanceMap = {};
      students.forEach(student => {
        const existing = existingAttendance.find(a => a.student_id === student.id);
        attendanceMap[student.id] = {
          status_type: existing ? existing.status_type : '',
          remake: existing ? existing.remake : '',
          attendance_id: existing ? existing.id : null
        };
      });
      
      setClassStudents(students);
      setStudentAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading students:', error);
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [selectedEnrollment, attendanceDate, showError]);

  useEffect(() => {
    if (selectedEnrollment) {
      loadClassStudents();
    }
  }, [selectedEnrollment, attendanceDate, loadClassStudents]);

  // Reload history when enrollment changes if in history view
  useEffect(() => {
    if (selectedEnrollment && subView === 'history') {
      loadClassHistory();
    }
  }, [selectedEnrollment]);

  const handleEnrollmentChange = (enrollmentId) => {
    const enrollment = subjectEnrollments.find(e => e.id === parseInt(enrollmentId));
    setSelectedEnrollment(enrollment || null);
    setClassStudents([]);
    setStudentAttendance({});
  };

  const handleStatusChange = (studentId, statusType) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status_type: statusType
      }
    }));
  };

  const handleRemarkChange = (studentId, remake) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remake: remake
      }
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedEnrollment) {
      showWarning('Please select a class first');
      return;
    }

    // Prepare attendance records
    const attendanceRecords = [];
    classStudents.forEach(student => {
      const attendance = studentAttendance[student.id];
      if (attendance && attendance.status_type) {
        attendanceRecords.push({
          student_id: student.id,
          subject_enroll_id: selectedEnrollment.id,
          status_type: parseInt(attendance.status_type),
          remake: attendance.remake || '',
          attendance_date: attendanceDate,
          attendance_id: attendance.attendance_id
        });
      }
    });

    if (attendanceRecords.length === 0) {
      showWarning('Please mark attendance for at least one student');
      return;
    }

    try {
      await api.saveBulkAttendance(attendanceRecords);
      showSuccess(`Attendance saved successfully for ${attendanceRecords.length} students`);
      loadClassStudents(); // Reload to get updated IDs
    } catch (error) {
      console.error('Error saving attendance:', error);
      showError('Failed to save attendance');
    }
  };

  const handleSetAllStatus = (statusType) => {
    const newAttendance = {};
    classStudents.forEach(student => {
      newAttendance[student.id] = {
        ...studentAttendance[student.id],
        status_type: statusType
      };
    });
    setStudentAttendance(newAttendance);
  };

  const loadClassHistory = async () => {
    if (!selectedEnrollment) return;
    
    try {
      setLoading(true);
      const filters = {
        subject_enroll_id: selectedEnrollment.id
      };
      if (filterDateFrom) filters.date_from = filterDateFrom;
      if (filterDateTo) filters.date_to = filterDateTo;
      
      const response = await api.getAttendanceByFilters(filters);
      setAttendanceHistory(response.data || []);
      setSubView('history');
    } catch (error) {
      console.error('Error loading history:', error);
      showError('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentDetails = (studentId) => {
    // Navigate to the dedicated attendance detail page with subject enrollment id
    navigate(`/attendance/student/${studentId}?subjectEnrollId=${selectedEnrollment?.id}`);
  };

  const getCurrentStats = () => {
    const stats = {
      total: classStudents.length,
      marked: Object.values(studentAttendance).filter(a => a.status_type).length,
      present: Object.values(studentAttendance).filter(a => a.status_type === 1).length,
      absent: Object.values(studentAttendance).filter(a => a.status_type === 2).length,
      late: Object.values(studentAttendance).filter(a => a.status_type === 3).length,
      excused: Object.values(studentAttendance).filter(a => a.status_type === 4).length
    };
    return stats;
  };

  const stats = getCurrentStats();

  if (loading && subjectEnrollments.length === 0) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '0 40px' }}>
        {/* Modern Header */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1f2937', margin: 0, marginBottom: 8 }}>
            📋 Attendance Management
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
            Track and manage student attendance records
          </p>
        </div>

        {/* Class Selection Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 20px rgba(0,0,0,.08)',
          padding: 24,
          marginBottom: 24
        }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>
            📚 Select Class
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 280px)', 
              gap: '20px', 
              width: '100%'
            }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <label style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '10px', display: 'block', fontWeight: '600' }}>
                  Subject Enrollment <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={selectedEnrollment?.id || ''}
                  onChange={(e) => handleEnrollmentChange(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '10px', 
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    background: '#f9fafb',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="">Select a class...</option>
                  {subjectEnrollments.map(enroll => (
                    <option key={enroll.id} value={enroll.id}>
                      {enroll.subject_name} - {enroll.batch_code} (Sem {enroll.semester}) - Teacher: {enroll.teacher_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <label style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '10px', display: 'block', fontWeight: '600' }}>
                  Attendance Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '10px', 
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    maxWidth: '100%',
                    background: '#f9fafb',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {selectedEnrollment && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px', 
                paddingTop: '10px', 
                borderTop: '1px solid #e5e7eb'
              }}>
                {/* Tab Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setSubView('add')} 
                    style={{ 
                      padding: '12px 28px', 
                      fontSize: '0.95rem', 
                      background: subView === 'add' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                      color: subView === 'add' ? 'white' : '#6b7280',
                      border: subView === 'add' ? 'none' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      boxShadow: subView === 'add' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (subView !== 'add') {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.color = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (subView !== 'add') {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.color = '#6b7280';
                      }
                    }}
                  >
                    <span>✏️</span> Add Attendance
                  </button>
                  <button 
                    onClick={() => {
                      setSubView('history');
                      loadClassHistory();
                    }} 
                    style={{ 
                      padding: '12px 28px', 
                      fontSize: '0.95rem', 
                      background: subView === 'history' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                      color: subView === 'history' ? 'white' : '#6b7280',
                      border: subView === 'history' ? 'none' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      boxShadow: subView === 'history' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (subView !== 'history') {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.color = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (subView !== 'history') {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.color = '#6b7280';
                      }
                    }}
                  >
                    <span>📊</span> View History
                  </button>
                </div>

                {/* Quick Action Buttons - Only show in Add mode */}
                {subView === 'add' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleSetAllStatus('1')} 
                      className="btn-secondary"
                      style={{ 
                        padding: '10px 20px', 
                        fontSize: '0.85rem', 
                        background: '#10b981', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Mark all as Present"
                    >
                      <span>✅</span> All Present
                    </button>
                    <button 
                      onClick={() => handleSetAllStatus('2')} 
                      className="btn-secondary"
                      style={{ 
                        padding: '10px 20px', 
                        fontSize: '0.85rem', 
                        background: '#ef4444', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Mark all as Absent"
                    >
                      <span>❌</span> All Absent
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content based on sub-view */}
        {selectedEnrollment && subView === 'add' && (
          <div style={{ 
            background: 'white', 
            borderRadius: 16, 
            boxShadow: '0 4px 20px rgba(0,0,0,.08)',
            padding: 24
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading students...
              </div>
            ) : classStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No students found in this class
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '24px',
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📋</span> Mark Attendance
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, fontWeight: '500' }}>
                      {selectedEnrollment.subject_name} - {selectedEnrollment.batch_code} (Semester {selectedEnrollment.semester})
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>Date</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                      {new Date(attendanceDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ width: '70px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>No.</th>
                        <th style={{ width: '140px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Student ID</th>
                        <th style={{ minWidth: '220px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Student Name</th>
                        <th style={{ width: '220px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                            <span>Attendance Status</span>
                            <span style={{ color: '#fef2f2', fontSize: '0.95rem' }}>*</span>
                          </div>
                        </th>
                        <th style={{ minWidth: '280px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student, index) => {
                        const hasStatus = studentAttendance[student.id]?.status_type;
                        const statusId = studentAttendance[student.id]?.status_type;
                        let rowColor = 'transparent';
                        
                        if (statusId === 1) rowColor = '#f0fdf4'; // Present - light green
                        else if (statusId === 2) rowColor = '#fef2f2'; // Absent - light red
                        else if (statusId === 3) rowColor = '#fefce8'; // Late - light yellow
                        else if (statusId === 4) rowColor = '#eff6ff'; // Excused - light blue

                        return (
                          <tr key={student.id} style={{ background: rowColor, transition: 'background 0.2s', borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.9rem', padding: '14px 12px', color: '#374151' }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span style={{ 
                                fontFamily: 'monospace', 
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                color: '#374151',
                                background: '#f3f4f6',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                display: 'inline-block'
                              }}>
                                {student.student_code}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                                {student.eng_name}
                              </div>
                              {student.khmer_name && (
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '3px' }}>
                                  {student.khmer_name}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <select
                                value={studentAttendance[student.id]?.status_type || ''}
                                onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                style={{ 
                                  width: '100%', 
                                  padding: '12px 16px', 
                                  border: hasStatus ? '2px solid #10b981' : '2px solid #cbd5e1', 
                                  borderRadius: '8px', 
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  background: hasStatus ? '#f0fdf4' : 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  color: hasStatus ? '#1f2937' : '#64748b',
                                  boxShadow: hasStatus ? '0 2px 6px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = hasStatus ? '#10b981' : '#cbd5e1'}
                              >
                                <option value="" style={{ color: '#9ca3af' }}>-- Select Status --</option>
                                {statusTypes.map(status => (
                                  <option key={status.id} value={status.id} style={{ color: '#1f2937', padding: '8px' }}>
                                    {status.status_name === 'Present' && '✅ '}
                                    {status.status_name === 'Absent' && '❌ '}
                                    {status.status_name === 'Late' && '⏰ '}
                                    {status.status_name === 'Excused' && '📝 '}
                                    {status.status_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <input
                                type="text"
                                value={studentAttendance[student.id]?.remake || ''}
                                onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                placeholder="Add note (optional)..."
                                style={{ 
                                  width: '100%', 
                                  padding: '12px 16px', 
                                  border: '2px solid #cbd5e1', 
                                  borderRadius: '8px', 
                                  fontSize: '0.9rem',
                                  transition: 'all 0.2s',
                                  background: 'white',
                                  boxSizing: 'border-box',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                  outline: 'none',
                                  color: '#1f2937'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#667eea';
                                  e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.15)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#cbd5e1';
                                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Stats & Submit Section */}
                <div style={{ 
                  marginTop: '24px', 
                  padding: '24px',
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ 
                      background: 'white', 
                      padding: '16px 20px', 
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      minWidth: '120px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
                        Total Students
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1f2937' }}>
                        {stats.total}
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      padding: '16px 20px', 
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      minWidth: '120px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'white', marginBottom: '6px', fontWeight: '500', opacity: 0.9 }}>
                        Marked
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>
                        {stats.marked}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center', background: 'white', padding: '12px 16px', borderRadius: '10px', minWidth: '80px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>
                          {stats.present}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginTop: '4px' }}>Present</div>
                      </div>
                      <div style={{ textAlign: 'center', background: 'white', padding: '12px 16px', borderRadius: '10px', minWidth: '80px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ef4444' }}>
                          {stats.absent}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginTop: '4px' }}>Absent</div>
                      </div>
                      <div style={{ textAlign: 'center', background: 'white', padding: '12px 16px', borderRadius: '10px', minWidth: '80px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>
                          {stats.late}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginTop: '4px' }}>Late</div>
                      </div>
                      <div style={{ textAlign: 'center', background: 'white', padding: '12px 16px', borderRadius: '10px', minWidth: '80px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6' }}>
                          {stats.excused}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginTop: '4px' }}>Excused</div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSaveAll}
                    disabled={stats.marked === 0}
                    style={{
                      padding: '16px 48px',
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      background: stats.marked === 0 ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: stats.marked === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: stats.marked === 0 ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.2s',
                      transform: stats.marked === 0 ? 'none' : 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      if (stats.marked > 0) {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (stats.marked > 0) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>✅</span>
                    <span>Save Attendance</span>
                    {stats.marked > 0 && (
                      <span style={{ 
                        background: 'rgba(255,255,255,0.3)', 
                        padding: '2px 10px', 
                        borderRadius: '12px',
                        fontSize: '0.9rem'
                      }}>
                        {stats.marked}
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {!selectedEnrollment && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              No Class Selected
            </h3>
            <p style={{ fontSize: '0.95rem' }}>
              Please select a subject enrollment above to mark attendance for students
            </p>
          </div>
        )}

        {/* History View for selected class */}
        {selectedEnrollment && subView === 'history' && (
          <>
            {/* Filter Card */}
            <div style={{ 
              background: 'white', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0,0,0,.08)',
              padding: 24,
              marginBottom: 24
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                marginBottom: 20 
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>
                  Filter History
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '10px', display: 'block', fontWeight: '600' }}>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        border: '2px solid #e5e7eb', 
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        background: '#f9fafb',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '10px', display: 'block', fontWeight: '600' }}>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        border: '2px solid #e5e7eb', 
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        background: '#f9fafb',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <button 
                    onClick={loadClassHistory} 
                    style={{ 
                      padding: '12px 32px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    <span>🔍</span> Apply Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div style={{ 
              background: 'white', 
              borderRadius: 16, 
              boxShadow: '0 4px 20px rgba(0,0,0,.08)',
              padding: 24
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24,
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700' }}>
                    📊 Attendance Summary by Student
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                    {(() => {
                      const studentMap = {};
                      attendanceHistory.forEach(record => {
                        if (!studentMap[record.student_id]) {
                          studentMap[record.student_id] = true;
                        }
                      });
                      return Object.keys(studentMap).length;
                    })()} students • {attendanceHistory.length} total records
                  </p>
                </div>
              </div>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Loading history...
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', zIndex: 10 }}>
                      <tr>
                        <th style={{ width: '70px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>No.</th>
                        <th style={{ minWidth: '220px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Student Name</th>
                        <th style={{ width: '140px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Student ID</th>
                        <th style={{ width: '120px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.1rem' }}>✅</span> Present
                          </div>
                        </th>
                        <th style={{ width: '120px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.1rem' }}>❌</span> Absent
                          </div>
                        </th>
                        <th style={{ width: '120px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.1rem' }}>⏰</span> Late
                          </div>
                        </th>
                        <th style={{ width: '120px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.1rem' }}>📝</span> Excused
                          </div>
                        </th>
                        <th style={{ width: '120px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Total Days</th>
                        <th style={{ width: '140px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                              No Records Found
                            </div>
                            <div style={{ fontSize: '0.95rem' }}>
                              Try adjusting your date filters to see attendance records
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (() => {
                          // Group by student
                          const studentStats = {};
                          attendanceHistory.forEach(record => {
                            if (!studentStats[record.student_id]) {
                              studentStats[record.student_id] = {
                                student_name: record.student_name,
                                student_code: record.student_code,
                                present: 0,
                                absent: 0,
                                late: 0,
                                excused: 0,
                                total: 0
                              };
                            }
                            const status = record.status_name?.toLowerCase();
                            if (status === 'present') studentStats[record.student_id].present++;
                            else if (status === 'absent') studentStats[record.student_id].absent++;
                            else if (status === 'late') studentStats[record.student_id].late++;
                            else if (status === 'excused') studentStats[record.student_id].excused++;
                            studentStats[record.student_id].total++;
                          });
                          
                          return Object.keys(studentStats).map((studentId, index) => {
                            const stats = studentStats[studentId];
                            return (
                              <tr key={studentId} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                                <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.9rem', padding: '14px 12px', color: '#374151' }}>
                                  {index + 1}
                                </td>
                                <td style={{ padding: '14px 12px' }}>
                                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                                    {stats.student_name}
                                  </div>
                                </td>
                                <td style={{ padding: '14px 12px' }}>
                                  <span style={{ 
                                    fontFamily: 'monospace', 
                                    fontWeight: '600',
                                    background: '#f3f4f6',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    display: 'inline-block'
                                  }}>
                                    {stats.student_code}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem'
                                  }}>
                                    {stats.present}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem'
                                  }}>
                                    {stats.absent}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem'
                                  }}>
                                    {stats.late}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem'
                                  }}>
                                    {stats.excused}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem'
                                  }}>
                                    {stats.total}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <button 
                                    onClick={() => handleViewStudentDetails(studentId)}
                                    style={{
                                      padding: '6px 16px',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'transform 0.2s',
                                      whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                  >
                                    <span>👁️</span> View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                        })()
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
