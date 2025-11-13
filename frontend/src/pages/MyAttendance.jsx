import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function MyAttendance() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await api.getMyAttendanceClasses();
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
    setLoadingRecords(true);
    try {
      const response = await api.getMyClassAttendance(classItem.subject_enroll_id);
      if (response.success) {
        setAttendanceRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      alert('Failed to load attendance: ' + error.message);
    } finally {
      setLoadingRecords(false);
    }
  };

  const getStatusEmoji = (statusType) => {
    switch(statusType) {
      case 1: return '✅';
      case 2: return '❌';
      case 3: return '⏰';
      case 4: return '📝';
      default: return '❓';
    }
  };

  const getStatusStyle = (statusType) => {
    switch(statusType) {
      case 1: return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 2: return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 3: return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 4: return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateStats = () => {
    if (!selectedClass) return { rate: 0, total: 0, present: 0, absent: 0, late: 0, excused: 0 };
    return {
      rate: selectedClass.attendance_rate || 0,
      total: selectedClass.total_days || 0,
      present: selectedClass.present_count || 0,
      absent: selectedClass.absent_count || 0,
      late: selectedClass.late_count || 0,
      excused: selectedClass.excused_count || 0
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
                <span style={{ fontSize: '2rem' }}>📅</span>
                My Attendance
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: '#64748b',
                fontWeight: '500'
              }}>
                View your attendance records for all enrolled classes
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
                  const attendanceRate = classItem.attendance_rate || 0;
                  
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

                      {/* Attendance Rate */}
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
                            Attendance Rate
                          </span>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#667eea'
                          }}>
                            {attendanceRate}%
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
                            width: `${attendanceRate}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>

                      {/* Status Counts */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          background: '#dcfce7',
                          padding: '12px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Present</div>
                          <div style={{ fontSize: '1.5rem', color: '#166534', fontWeight: '800' }}>{classItem.present_count || 0}</div>
                        </div>
                        <div style={{
                          background: '#fee2e2',
                          padding: '12px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Absent</div>
                          <div style={{ fontSize: '1.5rem', color: '#991b1b', fontWeight: '800' }}>{classItem.absent_count || 0}</div>
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
                        <span>📋</span> View Attendance
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Attendance Detail View */}
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
                  <span>📚 Semester {selectedClass.semester} - {selectedClass.academic_year}</span>
                  <span>⭐ {selectedClass.credit} Credit{selectedClass.credit !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Stats */}
              {(() => {
                const stats = calculateStats();
                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                        {stats.total}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>
                        Total Days
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
                        {stats.rate}%
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>
                        Attendance Rate
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                        {stats.present}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>
                        Present
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                        {stats.absent}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>
                        Absent
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Attendance Records */}
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
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading attendance...</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '80px 40px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>📅</div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#374151' 
                }}>
                  No Attendance Records
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  color: '#6b7280' 
                }}>
                  Your teacher hasn't recorded any attendance for this class yet.
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
                    Attendance Records
                  </h3>
                </div>

                <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                  {attendanceRecords.map((record, index) => {
                    const statusStyle = getStatusStyle(record.status_type);

                    return (
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
                          {/* Status Emoji */}
                          <div style={{ fontSize: '2.5rem' }}>
                            {getStatusEmoji(record.status_type)}
                          </div>

                          {/* Record Details */}
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
                                {formatDate(record.attendance_date)}
                              </span>
                              <span style={{
                                background: statusStyle.bg,
                                color: statusStyle.text,
                                border: `2px solid ${statusStyle.border}`,
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {record.status_name}
                              </span>
                            </div>
                            {record.remake && (
                              <div style={{
                                background: statusStyle.bg,
                                border: `2px solid ${statusStyle.border}`,
                                borderRadius: '8px',
                                padding: '12px',
                                marginTop: '8px'
                              }}>
                                <span style={{
                                  fontSize: '0.85rem',
                                  color: statusStyle.text,
                                  fontWeight: '600'
                                }}>
                                  <strong>Note:</strong> {record.remake}
                                </span>
                              </div>
                            )}
                            {record.marked_by && (
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#6b7280',
                                marginTop: '8px'
                              }}>
                                Marked by <strong>{record.marked_by}</strong>
                              </div>
                            )}
                          </div>

                          {/* Time */}
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
                              TIME
                            </div>
                            <div style={{
                              fontSize: '0.9rem',
                              color: '#1f2937',
                              fontWeight: '700'
                            }}>
                              {new Date(record.marked_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
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
