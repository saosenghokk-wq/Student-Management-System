import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalUsers: 0,
    totalTeachers: 0,
    pendingRegistrations: 0,
    totalDepartments: 0,
    totalPrograms: 0,
    totalMajors: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topDepartments, setTopDepartments] = useState([]);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      loadDashboardData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await api.getDashboardStats();
      setStats(statsResponse.stats);

      // Fetch recent students
      const studentsResponse = await api.getRecentStudents(5);
      setRecentStudents(studentsResponse.students);

      // Fetch recent activity
      const activityResponse = await api.getRecentActivity(10);
      setRecentActivity(activityResponse.activities);

      // Fetch top departments
      const departmentsResponse = await api.getTopDepartments();
      setTopDepartments(departmentsResponse.departments);

      // Fetch monthly registrations
      const registrationsResponse = await api.getMonthlyRegistrations();
      setMonthlyRegistrations(registrationsResponse.monthlyRegistrations);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (!user) return null;

  const statCards = [
    { 
      label: 'TOTAL STUDENTS', 
      value: stats.totalStudents, 
      icon: '👥',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/students'
    },
    { 
      label: 'TOTAL USERS', 
      value: stats.totalUsers, 
      icon: '👤',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/users'
    },
    { 
      label: 'TOTAL TEACHERS', 
      value: stats.totalTeachers, 
      icon: '👨‍🏫',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/teachers'
    },
    { 
      label: 'DEPARTMENTS', 
      value: stats.totalDepartments, 
      icon: '🏢',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: '/departments'
    },
    { 
      label: 'PROGRAMS', 
      value: stats.totalPrograms, 
      icon: '📚',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/programs'
    },
    { 
      label: 'MAJORS', 
      value: stats.totalMajors, 
      icon: '🎓',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      path: '/programs'
    },
    { 
      label: 'ACTIVE STUDENTS', 
      value: stats.activeStudents, 
      icon: '✅',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      path: '/students'
    },
    { 
      label: 'PENDING APPROVALS', 
      value: stats.pendingRegistrations, 
      icon: '⏳',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      path: '/students'
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ 
        padding: '24px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        {/* Enhanced Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '800', 
                marginBottom: '8px',
                background: 'linear-gradient(45deg, #fff 0%, #f0f8ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Dashboard Overview
              </h1>
              <p style={{ 
                fontSize: '1.1rem', 
                opacity: '0.9',
                fontWeight: '400'
              }}>
                Welcome back! Here's what's happening in your institution today.
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {statCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '0',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                transition: 'all 0.4s ease',
                minHeight: '160px',
                border: '1px solid #f1f5f9'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
            >
              {/* Card Content */}
              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      {card.label}
                    </div>
                    <div style={{
                      fontSize: '3rem',
                      fontWeight: '800',
                      color: '#1e293b',
                      lineHeight: '1'
                    }}>
                      {card.value.toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    background: card.gradient,
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '1.5rem'
                  }}>
                    {card.icon}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: card.gradient,
                    height: '100%',
                    width: `${Math.min(100, (card.value / Math.max(...statCards.map(c => c.value))) * 100)}%`,
                    borderRadius: '8px',
                    transition: 'width 1s ease'
                  }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
