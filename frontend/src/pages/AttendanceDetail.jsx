import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { API_BASE } from '../api/api';
import '../styles/table.css';

// Direct fetch function for this page
const fetchStudentAttendance = async (studentId, subjectEnrollId = null) => {
  try {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    let url = `${API_BASE}/api/attendance/student/${studentId}`;
    if (subjectEnrollId) {
      url += `?subjectEnrollId=${subjectEnrollId}`;
    }
    
    console.log('Fetching attendance with URL:', url);
    console.log('Filters - studentId:', studentId, 'subjectEnrollId:', subjectEnrollId);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('Error response:', data);
      throw new Error(data?.message || `HTTP ${res.status}: Failed to fetch attendance`);
    }
    
    const jsonData = await res.json();
    console.log('Success response:', jsonData);
    return jsonData;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check your connection.');
    }
    throw error;
  }
};

function AttendanceDetail() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const subjectEnrollId = searchParams.get('subjectEnrollId');
  const navigate = useNavigate();
  
  console.log('AttendanceDetail - studentId:', studentId, 'subjectEnrollId:', subjectEnrollId);
  
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0
  });

  useEffect(() => {
    loadStudentAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, subjectEnrollId]);

  const loadStudentAttendance = async () => {
    try {
      setLoading(true);
      
      console.log('Loading attendance for student:', studentId, 'subject:', subjectEnrollId);
      
      const response = await fetchStudentAttendance(studentId, subjectEnrollId);
      console.log('Response:', response);
      
      if (response.success) {
        const records = response.data;
        console.log('Records count:', records.length);
        setAttendanceRecords(records);
        
        if (records.length > 0) {
          setStudentInfo({
            name: records[0].student_name,
            code: records[0].student_code,
            batch: records[0].batch_name,
            subject: records[0].subject_name,
            subjectCode: records[0].subject_code
          });
        } else {
          console.log('No records found - student may not have attendance for this class yet');
          // Set basic info even if no records
          setStudentInfo({
            name: 'Student',
            code: studentId,
            batch: '',
            subject: '',
            subjectCode: ''
          });
        }
        
        calculateStats(records);
      } else {
        console.error('Response not successful:', response);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      console.error('Error stack:', error.stack);
      const errorMsg = error.message || 'Failed to load attendance records';
      alert(`Failed to load attendance records: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const stats = {
      total: records.length,
      present: records.filter(r => r.status_name === 'Present').length,
      absent: records.filter(r => r.status_name === 'Absent').length,
      late: records.filter(r => r.status_name === 'Late').length,
      excused: records.filter(r => r.status_name === 'Excused').length
    };
    setStats(stats);
  };

  // const getStatusBadgeClass = (statusName) => {
  //   switch(statusName) {
  //     case 'Present': return 'badge-success';
  //     case 'Absent': return 'badge-danger';
  //     case 'Late': return 'badge-warning';
  //     case 'Excused': return 'badge-info';
  //     default: return 'badge-secondary';
  //   }
  // };

  // const exportToCSV = () => {
  //   const headers = ['Date', 'Status', 'Remark', 'Modified By', 'Modified Date'];
  //   const rows = attendanceRecords.map(record => [
  //     new Date(record.attendance_date).toLocaleDateString(),
  //     record.status_name,
  //     record.remake || '',
  //     record.modified_by_name || '',
  //     record.marked_at ? new Date(record.marked_at).toLocaleString() : ''
  //   ]);

  //   const csvContent = [
  //     headers.join(','),
  //     ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  //   ].join('\n');

  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${studentInfo?.code}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
  //   a.click();
  // };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner" />
          <p>Loading attendance records...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
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
          <span style={{ fontSize: '1.2rem' }}>←</span> Back
        </button>

        {/* Header Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #f3f4f6'
        }}>
          {/* Title and Student Info */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
              Attendance Details
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                {studentInfo?.name || 'Student'}
              </div>
              <div style={{
                background: '#f9fafb',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                fontFamily: 'monospace',
                border: '2px solid #e5e7eb'
              }}>
                ID: {studentInfo?.code || studentId}
              </div>
              {studentInfo?.subject && (
                <div style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '2px solid #dbeafe'
                }}>
                  <span>📚</span> {studentInfo.subject} ({studentInfo.subjectCode})
                </div>
              )}
              {studentInfo?.batch && (
                <div style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '2px solid #dcfce7'
                }}>
                  <span>🎓</span> {studentInfo.batch}
                </div>
              )}
            </div>
          </div>
            
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4px' }}>{stats.total}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>Total Days</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4px' }}>{stats.present}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>✅ Present</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4px' }}>{stats.absent}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>❌ Absent</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4px' }}>{stats.late}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>⏰ Late</div>
            </div>
            {stats.excused > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4px' }}>{stats.excused}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '600' }}>📝 Excused</div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Rate Chart */}
        {attendanceRecords.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1f2937', 
              fontSize: '1.3rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📊</span>
              Attendance Rate
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ 
                flex: 1, 
                background: '#f3f4f6', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                height: '40px', 
                display: 'flex',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
              }}>
                {stats.present > 0 && (
                  <div style={{
                    width: `${(stats.present / stats.total) * 100}%`,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    transition: 'width 0.5s ease'
                  }}>
                    {((stats.present / stats.total) * 100).toFixed(1)}%
                  </div>
                )}
                {stats.late > 0 && (
                  <div style={{
                    width: `${(stats.late / stats.total) * 100}%`,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    transition: 'width 0.5s ease'
                  }}>
                    {((stats.late / stats.total) * 100).toFixed(1)}%
                  </div>
                )}
                {stats.absent > 0 && (
                  <div style={{
                    width: `${(stats.absent / stats.total) * 100}%`,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    transition: 'width 0.5s ease'
                  }}>
                    {((stats.absent / stats.total) * 100).toFixed(1)}%
                  </div>
                )}
                {stats.excused > 0 && (
                  <div style={{
                    width: `${(stats.excused / stats.total) * 100}%`,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    transition: 'width 0.5s ease'
                  }}>
                    {((stats.excused / stats.total) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                }}></div>
                <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>
                  Present: <strong style={{ color: '#10b981' }}>{stats.present}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                }}></div>
                <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>
                  Late: <strong style={{ color: '#f59e0b' }}>{stats.late}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                }}></div>
                <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>
                  Absent: <strong style={{ color: '#ef4444' }}>{stats.absent}</strong>
                </span>
              </div>
              {stats.excused > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                  }}></div>
                  <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>
                    Excused: <strong style={{ color: '#3b82f6' }}>{stats.excused}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Records Table */}
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
              <span style={{ fontSize: '1.5rem' }}>📚</span>
              Attendance Records
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '4px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                marginLeft: '8px',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }}>
                {attendanceRecords.length}
              </span>
            </h3>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', zIndex: 10 }}>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>No.</th>
                  <th style={{ minWidth: '200px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>📅</span> Date
                    </div>
                  </th>
                  <th style={{ width: '160px', textAlign: 'center', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>Status</th>
                  <th style={{ minWidth: '320px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>💬</span> Remark
                    </div>
                  </th>
                  <th style={{ minWidth: '180px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>👤</span> Modified By
                    </div>
                  </th>
                  <th style={{ minWidth: '200px', padding: '16px 12px', fontSize: '0.875rem', fontWeight: '700', color: '#fff', borderBottom: '2px solid #5a67d8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🕒</span> Modified Date
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                        No Records Found
                      </div>
                      <div style={{ fontSize: '1rem', marginTop: '8px' }}>
                        This student has no attendance records for this class yet
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record, index) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: '700', 
                        color: '#374151',
                        fontSize: '0.9rem',
                        padding: '14px 12px'
                      }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ 
                          fontWeight: '700',
                          color: '#1f2937',
                          fontSize: '0.95rem'
                        }}>
                          {new Date(record.attendance_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '14px 12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          background: record.status_name === 'Present' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                     record.status_name === 'Absent' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                     record.status_name === 'Late' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                     record.status_name === 'Excused' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#6b7280',
                          color: 'white',
                          boxShadow: record.status_name === 'Present' ? '0 4px 12px rgba(16, 185, 129, 0.3)' :
                                    record.status_name === 'Absent' ? '0 4px 12px rgba(239, 68, 68, 0.3)' :
                                    record.status_name === 'Late' ? '0 4px 12px rgba(245, 158, 11, 0.3)' :
                                    record.status_name === 'Excused' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                        }}>
                          {record.status_name === 'Present' && '✅'}
                          {record.status_name === 'Absent' && '❌'}
                          {record.status_name === 'Late' && '⏰'}
                          {record.status_name === 'Excused' && '📝'}
                          {record.status_name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: record.remake ? '#374151' : '#9ca3af',
                          fontStyle: record.remake ? 'normal' : 'italic',
                          fontWeight: record.remake ? '500' : '400'
                        }}>
                          {record.remake || 'No remark'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#374151',
                          fontWeight: '600'
                        }}>
                          {record.modified_by_name || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#374151',
                          fontFamily: 'monospace',
                          fontWeight: '500'
                        }}>
                          {record.marked_at ? new Date(record.marked_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
}

export default AttendanceDetail;
