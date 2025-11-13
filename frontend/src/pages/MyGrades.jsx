import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function MyGrades() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classGrades, setClassGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await api.getMyClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      alert('Failed to load classes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = async (classItem) => {
    setSelectedClass(classItem);
    setLoadingGrades(true);
    try {
      const response = await api.getMyClassGrades(classItem.subject_enroll_id);
      if (response.success) {
        setClassGrades(response.data);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      alert('Failed to load grades: ' + error.message);
    } finally {
      setLoadingGrades(false);
    }
  };

  const calculateStats = () => {
    if (classGrades.length === 0) return { average: 0, total: 0 };
    
    const total = classGrades.reduce((sum, grade) => {
      return sum + (grade.score / grade.max_score * 100);
    }, 0);
    
    return {
      average: (total / classGrades.length).toFixed(1),
      total: classGrades.length
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading your classes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {!selectedClass ? (
          <>
            {/* Header */}
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
                My Grades
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: '#64748b',
                fontWeight: '500'
              }}>
                View your grades for all enrolled classes
              </p>
            </div>

            {/* Classes Grid */}
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
                  You are not enrolled in any active classes yet.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {classes.map((classItem) => {
                  const progress = classItem.total_grade_types > 0 
                    ? (classItem.total_grades / classItem.total_grade_types * 100) 
                    : 0;
                  
                  return (
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
                      {/* Decorative corner */}
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

                      {/* Subject Code Badge */}
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

                      {/* Subject Name */}
                      <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        lineHeight: '1.4'
                      }}>
                        {classItem.subject_name}
                      </h3>

                      {/* Class Info */}
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
                            {classItem.semester} - {classItem.academic_year}
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

                      {/* Progress */}
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
                            Grade Progress
                          </span>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#667eea'
                          }}>
                            {classItem.total_grades}/{classItem.total_grade_types}
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
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>

                      {/* View Button */}
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
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Grade Detail View */}
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

            {/* Class Header */}
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
                  <span>📚 {selectedClass.semester} - {selectedClass.academic_year}</span>
                  <span>⭐ {selectedClass.credit} Credit{selectedClass.credit !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Stats */}
              {classGrades.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                      {calculateStats().total}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>
                      Total Grades
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                      {calculateStats().average}%
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>
                      Average Score
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grades Table */}
            {loadingGrades ? (
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
            ) : classGrades.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '80px 40px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>📝</div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#374151' 
                }}>
                  No Grades Yet
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  color: '#6b7280' 
                }}>
                  Your teacher hasn't entered any grades for this class yet.
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
                  {classGrades.map((grade, index) => {
                    const percentage = (grade.score / grade.max_score * 100);
                    const getColor = () => {
                      if (percentage >= 90) return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
                      if (percentage >= 80) return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
                      if (percentage >= 70) return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
                      if (percentage >= 60) return { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' };
                      return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
                    };
                    const colors = getColor();

                    return (
                      <div
                        key={grade.id}
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
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px'
                        }}>
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
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: '700',
                              color: '#1f2937'
                            }}>
                              {grade.grade_type}
                            </div>
                            <div style={{
                              fontSize: '0.85rem',
                              color: '#6b7280',
                              marginTop: '4px'
                            }}>
                              {new Date(grade.entry_date).toLocaleDateString('en-US', {
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
                              background: colors.bg,
                              color: colors.text,
                              border: `2px solid ${colors.border}`,
                              padding: '10px 20px',
                              borderRadius: '10px',
                              fontSize: '1.3rem',
                              fontWeight: '700'
                            }}>
                              {grade.score} / {grade.max_score}
                            </div>
                            <div style={{
                              marginTop: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: colors.text
                            }}>
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {grade.remark && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px 16px',
                            background: 'white',
                            borderRadius: '8px',
                            borderLeft: '4px solid #667eea'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              marginBottom: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Remark
                            </div>
                            <div style={{
                              color: '#374151',
                              lineHeight: '1.5'
                            }}>
                              {grade.remark}
                            </div>
                          </div>
                        )}

                        {grade.graded_by_name && (
                          <div style={{
                            marginTop: '12px',
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>👨‍🏫</span>
                            Graded by: {grade.graded_by_name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
