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
  // eslint-disable-next-line no-unused-vars
  const [recentStudents, setRecentStudents] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [recentActivity, setRecentActivity] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [topDepartments, setTopDepartments] = useState([]);
  // eslint-disable-next-line no-unused-vars
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
      // const studentsResponse = await api.getRecentStudents(5);
      // setRecentStudents(studentsResponse.students);

      // Fetch recent activity
      // const activityResponse = await api.getRecentActivity(10);
      // setRecentActivity(activityResponse.activities);

      // Fetch top departments
      // const departmentsResponse = await api.getTopDepartments();
      // setTopDepartments(departmentsResponse.departments);

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
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ 
        padding: '32px 40px', 
        maxWidth: '1600px', 
        margin: '0 auto',
        minHeight: '100vh'
      }}>
        {/* Enhanced Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          color: '#fff',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 20px',
                borderRadius: '30px',
                marginBottom: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '1.3rem' }}>👋</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Welcome back, {user?.username || 'User'}!</span>
              </div>
              <h1 style={{ 
                fontSize: '2.8rem', 
                fontWeight: '900', 
                marginBottom: '12px',
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px'
              }}>
                Dashboard Overview
              </h1>
              <p style={{ 
                fontSize: '1.15rem', 
                opacity: '0.95',
                fontWeight: '400',
                maxWidth: '600px',
                lineHeight: '1.6'
              }}>
                Monitor your institution's key metrics and performance at a glance
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '24px 32px',
              backdropFilter: 'blur(15px)',
              textAlign: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '0.85rem', opacity: '0.9', marginBottom: '8px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Today
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div style={{ fontSize: '1rem', opacity: '0.85', fontWeight: '600' }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px',
          marginBottom: '40px'
        }}>
          {statCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '0',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '140px',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), ' + card.gradient,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              {/* Decorative Background Element */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: card.gradient,
                borderRadius: '50%',
                opacity: 0.08,
                filter: 'blur(40px)'
              }} />

              {/* Card Content */}
              <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      letterSpacing: '1.2px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: '12px'
                    }}>
                      {card.label}
                    </div>
                    <div style={{
                      fontSize: '2.8rem',
                      fontWeight: '900',
                      background: card.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: '1',
                      marginBottom: '8px'
                    }}>
                      {card.value.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: card.gradient,
                        display: 'inline-block'
                      }} />
                      Click to view details
                    </div>
                  </div>
                  <div style={{
                    background: card.gradient,
                    borderRadius: '16px',
                    padding: '16px',
                    fontSize: '2rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '72px',
                    minHeight: '72px'
                  }}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
