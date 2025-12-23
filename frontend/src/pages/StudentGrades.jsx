import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
// import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

export default function StudentGrades() {
  // const { showSuccess, showError, showWarning } = useAlert();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [gradeRecords, setGradeRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      // Get student info from children list
      const children = await api.getMyChildren();
      const student = children.find(c => c.id === parseInt(studentId));
      setStudentInfo(student);
      // Get classes for grades
      const response = await api.getChildGradeClasses(studentId);
      if (response.success) {
        setClasses(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = async (classItem) => {
    setSelectedClass(classItem);
    setLoadingRecords(true);
    try {
      const response = await api.getChildClassGrades(studentId, classItem.subject_enroll_id);
      if (response.success) {
        setGradeRecords(response.data);
      }
    } catch (error) {
      setError(error.message || 'Failed to load grades');
    } finally {
      setLoadingRecords(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '20px' }}>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {!selectedClass ? (
          <>
            <button 
              onClick={() => navigate('/parent-grades')}
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                color: '#374151',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#374151';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>←</span> Back to Children
            </button>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '2rem' }}>📊</span>
                {studentInfo ? `${studentInfo.std_eng_name}'s Grades` : 'Grades'}
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: '#64748b',
                fontWeight: '500'
              }}>
                {studentInfo && `${studentInfo.std_khmer_name} - ${studentInfo.student_code}`}
              </p>
            </div>
            {error && (
              <div className="alert error" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}
            {classes.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '80px 40px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>📚</div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#374151' 
                }}>
                  No Classes Found
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  color: '#6b7280' 
                }}>
                  This student is not enrolled in any active classes yet.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {classes.map((classItem) => (
                  <div
                    key={classItem.subject_enroll_id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '2px solid #f3f4f6',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => handleClassClick(classItem)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#f3f4f6';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.1,
                      borderRadius: '0 16px 0 100%'
                    }} />
                    <div style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      marginBottom: '16px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      letterSpacing: '0.5px'
                    }}>
                      {classItem.subject_code}
                    </div>
                    <h3 style={{
                      margin: '0 0 16px 0',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      lineHeight: '1.4'
                    }}>
                      {classItem.subject_name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}>
                        <span>👨‍🏫</span>
                        <span style={{ fontWeight: '500' }}>
                          {classItem.teacher_name || 'No teacher assigned'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}>
                        <span>📚</span>
                        <span style={{ fontWeight: '500' }}>
                          Semester {classItem.semester} - {classItem.academic_year}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}>
                        <span>⭐</span>
                        <span style={{ fontWeight: '500' }}>
                          {classItem.credit} Credit{classItem.credit !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Grades Entered
                        </span>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: '#667eea'
                        }}>
                          {classItem.total_grades} / {classItem.total_grade_types}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(classItem.total_grades / classItem.total_grade_types) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                    <button
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span>📋</span> View Grades
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button 
              onClick={() => setSelectedClass(null)}
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                color: '#374151',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#374151';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>←</span> Back to Classes
            </button>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '2px solid #f3f4f6'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  {selectedClass.subject_code}
                </div>
                <h1 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '2rem', 
                  fontWeight: '800', 
                  color: '#1f2937'
                }}>
                  {selectedClass.subject_name}
                </h1>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  fontSize: '0.95rem',
                  color: '#6b7280'
                }}>
                  <span>👨‍🏫 {selectedClass.teacher_name || 'No teacher'}</span>
                  <span>📚 Semester {selectedClass.semester} - {selectedClass.academic_year}</span>
                  <span>⭐ {selectedClass.credit} Credit{selectedClass.credit !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            {loadingRecords ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '80px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #f3f4f6'
              }}>
                <div className="spinner" style={{ 
                  width: '50px', 
                  height: '50px', 
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading grades...</p>
              </div>
            ) : gradeRecords.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '80px 40px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>📊</div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#374151' 
                }}>
                  No Grade Records
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  color: '#6b7280' 
                }}>
                  No grades have been entered for this class yet.
                </p>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  padding: '24px 32px', 
                  borderBottom: '2px solid #e5e7eb' 
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#1f2937', 
                    fontSize: '1.3rem', 
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    Grade Records
                  </h3>
                </div>
                <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                  {gradeRecords.map((record, index) => (
                    <div
                      key={record.id || index}
                      style={{
                        background: '#f9fafb',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '16px',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontSize: '2.5rem' }}>📋</div>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontSize: '1.1rem',
                              fontWeight: '700',
                              color: '#1f2937'
                            }}>
                              {record.grade_type}
                            </span>
                            <span style={{
                              background: '#e0e7ff',
                              color: '#3730a3',
                              border: '2px solid #a5b4fc',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {record.score} / {record.max_score}
                            </span>
                          </div>
                          {record.remark && (
                            <div style={{
                              background: '#f3f4f6',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px',
                              marginTop: '8px'
                            }}>
                              <span style={{
                                fontSize: '0.85rem',
                                color: '#374151',
                                fontWeight: '600'
                              }}>
                                <strong>Note:</strong> {record.remark}
                              </span>
                            </div>
                          )}
                          {record.graded_by_name && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#6b7280',
                              marginTop: '8px'
                            }}>
                              Graded by <strong>{record.graded_by_name}</strong>
                            </div>
                          )}
                        </div>
                        <div style={{
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          minWidth: '80px'
                        }}>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#6b7280',
                            fontWeight: '600',
                            marginBottom: '4px'
                          }}>
                            DATE
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#1f2937',
                            fontWeight: '700'
                          }}>
                            {record.entry_date ? new Date(record.entry_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
