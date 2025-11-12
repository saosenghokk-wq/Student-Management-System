import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import '../styles/dashboard.css';

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
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">� Dashboard Overview</h1>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Main Content */}
          <div className="dashboard-main">
            {/* Stat Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {statCards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => navigate(card.path)}
                  style={{
                    background: card.gradient,
                    borderRadius: '20px',
                    padding: '30px',
                    color: 'white',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    opacity: '0.9',
                    marginBottom: '10px'
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    marginBottom: '10px'
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    bottom: '20px',
                    fontSize: '60px',
                    opacity: '0.2'
                  }}>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
