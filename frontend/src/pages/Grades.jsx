import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';
import '../styles/modal.css';

export default function Grades() {
  const { showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjectEnrollments, setSubjectEnrollments] = useState([]);
  const [gradeTypes, setGradeTypes] = useState([]);
  
  // Selected class
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedGradeType, setSelectedGradeType] = useState(null);
  
  // Students in selected class with their grades
  const [classStudents, setClassStudents] = useState([]);
  const [studentGrades, setStudentGrades] = useState({});
  
  // Sub-view mode when class is selected: 'add' or 'history'
  const [subView, setSubView] = useState('add');
  const [gradeHistory, setGradeHistory] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
  // Student detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEnrollment && selectedGradeType) {
      loadClassStudents();
    }
  }, [selectedEnrollment, selectedGradeType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        showWarning('Please login first');
        return;
      }
      
      // Load enrollments first
      console.log('Loading enrollments...');
      const enrollmentsRes = await api.getAttendanceSubjectEnrollments();
      console.log('Enrollments loaded:', enrollmentsRes.data?.length || 0);
      setSubjectEnrollments(enrollmentsRes.data || []);
      
      // Then load grade types
      console.log('Loading grade types...');
      const response = await fetch('http://localhost:5000/api/grades/types', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Grade types response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Grade types error response:', errorText);
        throw new Error(`Failed to fetch grade types: ${response.status} ${response.statusText}`);
      }
      
      const typesRes = await response.json();
      console.log('Grade types loaded:', typesRes);
      setGradeTypes(typesRes.data || typesRes || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async () => {
    if (!selectedEnrollment || !selectedGradeType) return;
    
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await api.getStudentsByBatch(selectedEnrollment.batch_id);
      const students = response.data || [];
      
      // Load existing grades for this class and grade type
      const gradesRes = await fetch(
        `http://localhost:5000/api/grades/class/${selectedEnrollment.id}?gradeTypeId=${selectedGradeType.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const gradesData = await gradesRes.json();
      const existingGrades = gradesData.data || [];
      
      // Initialize grades state
      const gradesMap = {};
      students.forEach(student => {
        const existing = existingGrades.find(g => g.student_id === student.id);
        gradesMap[student.id] = {
          score: existing ? existing.score : '',
          remark: existing ? existing.remark : '',
          grade_id: existing ? existing.id : null
        };
      });
      
      setClassStudents(students);
      setStudentGrades(gradesMap);
    } catch (error) {
      console.error('Error loading students:', error);
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentChange = (enrollmentId) => {
    const enrollment = subjectEnrollments.find(e => e.id == enrollmentId);
    setSelectedEnrollment(enrollment || null);
    setClassStudents([]);
    setStudentGrades({});
  };

  const handleGradeTypeChange = (gradeTypeId) => {
    const gradeType = gradeTypes.find(gt => gt.id == gradeTypeId);
    setSelectedGradeType(gradeType || null);
  };

  const handleScoreChange = (studentId, score) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: score
      }
    }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remark: remark
      }
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedEnrollment || !selectedGradeType) {
      showWarning('Please select a class and grade type first');
      return;
    }

    // Prepare grade records
    const gradeRecords = [];
    classStudents.forEach(student => {
      const grade = studentGrades[student.id];
      if (grade && grade.score !== '' && grade.score !== null) {
        gradeRecords.push({
          student_id: student.id,
          subject_enroll_id: selectedEnrollment.id,
          grade_type_id: parseInt(selectedGradeType.id),
          score: parseInt(grade.score),
          remark: grade.remark || '',
          grade_id: grade.grade_id
        });
      }
    });

    if (gradeRecords.length === 0) {
      showWarning('Please enter grades for at least one student');
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/grades/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records: gradeRecords })
      });
      
      const result = await response.json();
      if (result.success) {
        showSuccess(`Grades saved successfully for ${gradeRecords.length} students`);
        loadClassStudents(); // Reload to get updated IDs
      } else {
        showError('Failed to save grades: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      showError('Failed to save grades');
    }
  };

  const loadClassHistory = async () => {
    if (!selectedEnrollment) return;
    
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:5000/api/grades/class/${selectedEnrollment.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const result = await response.json();
      setGradeHistory(result.data || []);
      setSubView('history');
    } catch (error) {
      console.error('Error loading history:', error);
      showError('Failed to load grade history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentDetails = (studentId) => {
    // Find all records for this student
    const studentRecords = gradeHistory.filter(record => record.student_id === studentId);
    if (studentRecords.length > 0) {
      setSelectedStudentDetails({
        student_id: studentId,
        student_name: studentRecords[0].student_name,
        student_code: studentRecords[0].student_code,
        records: studentRecords
      });
      setShowDetailModal(true);
    }
  };

  const getStatusBadgeClass = (statusName) => {
    const status = statusName?.toLowerCase();
    if (status === 'present') return 'badge-success';
    if (status === 'absent') return 'badge-danger';
    if (status === 'late') return 'badge-warning';
    if (status === 'excused') return 'badge-info';
    return 'badge-secondary';
  };

  const getCurrentStats = () => {
    const stats = {
      total: classStudents.length,
      marked: Object.values(studentGrades).filter(g => g.score !== '' && g.score !== null).length,
      average: 0
    };
    
    // Calculate average score
    const scores = Object.values(studentGrades)
      .filter(g => g.score !== '' && g.score !== null)
      .map(g => parseInt(g.score));
    
    if (scores.length > 0) {
      stats.average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    }
    
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
            📊 Grade Management
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
            Enter and manage student grades
          </p>
        </div>

        {/* Class & Grade Type Selection Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 20px rgba(0,0,0,.08)',
          padding: 24,
          marginBottom: 24
        }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>
            📚 Select Class & Grade Type
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
                  Grade Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={selectedGradeType?.id || ''}
                  onChange={(e) => handleGradeTypeChange(e.target.value)}
                  disabled={!selectedEnrollment}
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '10px', 
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    maxWidth: '100%',
                    opacity: !selectedEnrollment ? 0.5 : 1,
                    background: '#f9fafb',
                    transition: 'all 0.2s',
                    cursor: !selectedEnrollment ? 'not-allowed' : 'pointer'
                  }}
                  onFocus={(e) => { if (selectedEnrollment) e.target.style.borderColor = '#667eea' }}
                  onBlur={(e) => { if (selectedEnrollment) e.target.style.borderColor = '#e5e7eb' }}
                >
                  <option value="">Select grade type...</option>
                  {gradeTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.grade_type} (Max: {type.max_score})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEnrollment && selectedGradeType && (
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
                    <span>📝</span> Enter Grades
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
                    <span>📜</span> View History
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Content based on sub-view */}
        {selectedEnrollment && selectedGradeType && subView === 'add' && (
          <div className="card">
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
                      <span style={{ fontSize: '1.4rem' }}>📝</span> Enter Grades
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, fontWeight: '500' }}>
                      {selectedEnrollment.subject_name} - {selectedEnrollment.batch_code} (Semester {selectedEnrollment.semester})
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>Grade Type</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                      {selectedGradeType?.grade_type} (Max: {selectedGradeType?.max_score})
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', zIndex: 10 }}>
                      <tr>
                        <th style={{ width: '70px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>No.</th>
                        <th style={{ width: '140px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Student ID</th>
                        <th style={{ minWidth: '220px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Student Name</th>
                        <th style={{ width: '180px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <span>Score (/{selectedGradeType?.max_score})</span>
                          </div>
                        </th>
                        <th style={{ minWidth: '280px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student, index) => {
                        const grade = studentGrades[student.id] || {};
                        const score = grade.score;
                        const maxScore = selectedGradeType?.max_score || 100;
                        let rowColor = 'transparent';
                        
                        // Color based on score percentage
                        if (score !== '' && score !== null) {
                          const percentage = (score / maxScore) * 100;
                          if (percentage >= 90) rowColor = '#f0fdf4'; // A - light green
                          else if (percentage >= 80) rowColor = '#ecfdf5'; // B - lighter green
                          else if (percentage >= 70) rowColor = '#fefce8'; // C - light yellow
                          else if (percentage >= 60) rowColor = '#fef3c7'; // D - light orange
                          else rowColor = '#fef2f2'; // F - light red
                        }

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
                            <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                              <input
                                type="number"
                                min="0"
                                max={maxScore}
                                value={grade.score || ''}
                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                placeholder="0"
                                style={{ 
                                  width: '120px', 
                                  padding: '12px 16px', 
                                  border: '2px solid #cbd5e1', 
                                  borderRadius: '8px', 
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                  background: 'white',
                                  transition: 'all 0.2s',
                                  boxSizing: 'border-box',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                  outline: 'none',
                                  color: '#1f2937',
                                  textAlign: 'center'
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
                            <td style={{ padding: '14px 12px' }}>
                              <input
                                type="text"
                                value={grade.remark || ''}
                                onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                placeholder="Add remark (optional)..."
                                style={{ 
                                  width: '100%', 
                                  maxWidth: '300px',
                                  padding: '12px 16px', 
                                  border: '2px solid #cbd5e1', 
                                  borderRadius: '8px', 
                                  fontSize: '0.9rem',
                                  transition: 'all 0.2s',
                                  boxSizing: 'border-box',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                  outline: 'none',
                                  background: 'white',
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

                {/* Submit Button */}
                <div style={{ 
                  marginTop: '20px', 
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '2px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                        Total Students
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                        {stats.total}
                      </div>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: '#e5e7eb' }}></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                        Marked
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6366f1' }}>
                        {stats.marked}
                      </div>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: '#e5e7eb' }}></div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#10b981' }}>
                          {stats.present}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Present</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ef4444' }}>
                          {stats.absent}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Absent</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b' }}>
                          {stats.late}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Late</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#3b82f6' }}>
                          {stats.excused}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Excused</div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSaveAll}
                    disabled={stats.marked === 0}
                    style={{
                      padding: '14px 40px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      background: stats.marked === 0 ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: stats.marked === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: stats.marked === 0 ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s',
                      transform: stats.marked === 0 ? 'none' : 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      if (stats.marked > 0) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (stats.marked > 0) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>💾</span>
                    <span>Submit Attendance</span>
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
                    📚 Grade History
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                    {gradeHistory.length} records • {selectedEnrollment.subject_name}
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
                        <th style={{ width: '140px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Total Records</th>
                        <th style={{ width: '160px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Latest Grade</th>
                        <th style={{ width: '160px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeHistory.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                              No Grade Records Found
                            </div>
                            <div style={{ fontSize: '0.95rem' }}>
                              Enter grades using the "Enter Grades" tab
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (() => {
                          // Group records by student
                          const studentGroups = {};
                          gradeHistory.forEach(record => {
                            if (!studentGroups[record.student_id]) {
                              studentGroups[record.student_id] = {
                                student_id: record.student_id,
                                student_name: record.student_name,
                                student_code: record.student_code,
                                records: []
                              };
                            }
                            studentGroups[record.student_id].records.push(record);
                          });

                          // Convert to array and sort by student name
                          const students = Object.values(studentGroups).sort((a, b) => 
                            a.student_name.localeCompare(b.student_name)
                          );

                          return students.map((student, index) => {
                            // Get latest grade (most recent record)
                            const latestRecord = student.records[student.records.length - 1];
                            
                            return (
                              <tr key={student.student_id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                                <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.9rem', padding: '14px 12px', color: '#374151' }}>
                                  {index + 1}
                                </td>
                                <td style={{ padding: '14px 12px' }}>
                                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                                    {student.student_name}
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
                                    {student.student_code}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#e0e7ff',
                                    color: '#4f46e5',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '1rem'
                                  }}>
                                    {student.records.length}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
                                    {latestRecord.grade_type}
                                  </div>
                                  <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '1rem'
                                  }}>
                                    {latestRecord.score}/{latestRecord.max_score}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                                  <button
                                    onClick={() => handleViewStudentDetails(student.student_id)}
                                    style={{
                                      padding: '8px 20px',
                                      fontSize: '0.9rem',
                                      fontWeight: '600',
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'translateY(-2px)';
                                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'translateY(0)';
                                      e.target.style.boxShadow = 'none';
                                    }}
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

      {/* Student Grade Details Modal */}
      {showDetailModal && selectedStudentDetails && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px 30px',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '700' }}>
                    Grade Details
                  </h2>
                  <div style={{ fontSize: '0.95rem', opacity: 0.95 }}>
                    <span style={{ fontWeight: '600' }}>{selectedStudentDetails.student_name}</span>
                    <span style={{ 
                      marginLeft: '12px',
                      padding: '4px 10px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontWeight: '500'
                    }}>
                      {selectedStudentDetails.student_code}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  ×
                </button>
              </div>
              
              {/* Summary Stats */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                gap: '16px'
              }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '4px' }}>Total Records</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {selectedStudentDetails.records.length}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '4px' }}>Average Score</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {(() => {
                      const total = selectedStudentDetails.records.reduce((sum, r) => sum + (r.score / r.max_score * 100), 0);
                      return (total / selectedStudentDetails.records.length).toFixed(1) + '%';
                    })()}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '4px' }}>Subject</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    {selectedEnrollment?.subject_name}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '24px 30px',
              overflow: 'auto',
              flex: 1
            }}>
              <div style={{ 
                display: 'grid', 
                gap: '16px'
              }}>
                {selectedStudentDetails.records.map((record, index) => (
                  <div 
                    key={record.id}
                    style={{
                      background: '#f9fafb',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ 
                          display: 'inline-block',
                          background: '#e0e7ff',
                          color: '#4f46e5',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}>
                          Grade #{index + 1}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>
                          {record.grade_type}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                          Entered: {new Date(record.entry_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'inline-block',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '1.3rem',
                          fontWeight: '700',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                          {record.score} / {record.max_score}
                        </div>
                        <div style={{ 
                          marginTop: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: (() => {
                            const percentage = (record.score / record.max_score) * 100;
                            if (percentage >= 90) return '#059669';
                            if (percentage >= 80) return '#10b981';
                            if (percentage >= 70) return '#f59e0b';
                            if (percentage >= 60) return '#f97316';
                            return '#dc2626';
                          })()
                        }}>
                          {((record.score / record.max_score) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {record.remark && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '8px',
                        borderLeft: '4px solid #667eea'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Remark
                        </div>
                        <div style={{ color: '#374151', lineHeight: '1.5' }}>
                          {record.remark}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f9fafb'
            }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '12px 32px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

