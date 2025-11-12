import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';
import { api } from '../api/api';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [systemSettings, setSystemSettings] = useState({
    system_title: 'Student Management System',
    system_logo: '/Picture1.jpg'
  });

  // Fetch fresh profile (Image) if missing (run once)
  useEffect(() => {
    let mounted = true;
    const loadProfileImage = async () => {
      if (!user) return;
      try {
        if (!user.Image) {
          const resp = await api.getProfile();
          const updated = { ...user, Image: resp.user?.Image || null };
          if (mounted) {
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated);
          }
        }
      } catch (e) {
        // silently ignore fetch issues
      }
    };
    loadProfileImage();
    return () => { mounted = false; };
  }, [user]);

  // Fetch system settings
  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const resp = await api.getSettings();
        if (mounted && resp.success && resp.data) {
          setSystemSettings({
            system_title: resp.data.system_title || 'Student Management System',
            system_logo: resp.data.system_logo || '/Picture1.jpg'
          });
          // Update document title and favicon
          document.title = resp.data.system_title || 'Student Management System';
          if (resp.data.system_logo) {
            const favicon = document.querySelector("link[rel~='icon']");
            if (favicon) {
              favicon.href = resp.data.system_logo;
            }
          }
        }
      } catch (e) {
        // silently ignore fetch issues - use defaults
      }
    };
    loadSettings();
    return () => { mounted = false; };
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const logout = () => {
    // Check if user wants to be remembered
    const rememberSession = localStorage.getItem('remember_session');
    
    // Clear all session data
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_expires');
    localStorage.removeItem('remember_session');
    
    // Only clear remember_username if remember_session was not enabled
    if (!rememberSession) {
      localStorage.removeItem('remember_username');
    }
    
    navigate('/login', { replace: true });
  };

  const getMenuItems = () => {
    const adminItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠', section: 'main' },
      { path: '/users', label: 'Users', icon: '👤', section: 'management' },
      { path: '/parents', label: 'Parents', icon: '👨‍👩‍👧', section: 'management' },
      { path: '/students', label: 'Students', icon: '👥', section: 'management' },
      { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', section: 'management' },
      { path: '/staff', label: 'Staff', icon: '👔', section: 'management' },
      { path: '/departments', label: 'Departments', icon: '🏢', section: 'academic' },
      { path: '/programs', label: 'Programs', icon: '📚', section: 'academic' },
      { path: '/subjects', label: 'Subjects', icon: '📖', section: 'academic' },
      { path: '/subject-enrollment', label: 'Subject Enrollment', icon: '📝', section: 'academic' },
      { path: '/admissions', label: 'Admissions', icon: '🎓', section: 'academic' },
      { path: '/batches', label: 'Batches', icon: '📚', section: 'academic' },
      { path: '/schedule', label: 'Schedule', icon: '📅', section: 'academic' },
      { path: '/attendance', label: 'Attendance', icon: '📋', section: 'operations' },
      { path: '/grades', label: 'Grades', icon: '📊', section: 'operations' },
      { path: '/fees', label: 'Fees', icon: '💰', section: 'operations' },
      { path: '/reports', label: 'Reports', icon: '📈', section: 'operations' },
      { path: '/settings', label: 'Settings', icon: '⚙️', section: 'system' },
    ];

    const teacherItems = [
      { path: '/students', label: 'Students', icon: '👥', section: 'academic' },
      { path: '/attendance', label: 'Attendance', icon: '📋', section: 'academic' },
      { path: '/grades', label: 'Grades', icon: '📊', section: 'academic' },
      { path: '/schedule', label: 'Schedule', icon: '📅', section: 'academic' },
    ];

    const registrarItems = [
      { path: '/parents', label: 'Parents', icon: '👨‍👩‍👧', section: 'management' },
      { path: '/students', label: 'Students', icon: '👥', section: 'management' },
      { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', section: 'management' },
      { path: '/staff', label: 'Staff', icon: '👔', section: 'management' },
      { path: '/departments', label: 'Departments', icon: '🏢', section: 'academic' },
      { path: '/programs', label: 'Programs', icon: '📚', section: 'academic' },
      { path: '/subjects', label: 'Subjects', icon: '📖', section: 'academic' },
      { path: '/subject-enrollment', label: 'Subject Enrollment', icon: '📝', section: 'academic' },
      { path: '/admissions', label: 'Admissions', icon: '🎓', section: 'academic' },
      { path: '/batches', label: 'Batches', icon: '📚', section: 'academic' },
    ];

    const studentItems = [
      { path: '/my-schedule', label: 'My Schedule', icon: '📅', section: 'personal' },
      { path: '/my-grades', label: 'My Grades', icon: '📊', section: 'personal' },
      { path: '/my-attendance', label: 'My Attendance', icon: '📋', section: 'personal' },
      { path: '/my-fees', label: 'My Fees', icon: '💰', section: 'personal' },
    ];

    const accountantItems = [
      { path: '/fees', label: 'Fees', icon: '💰', section: 'operations' },
    ];

    if (user.role_id === 1) return adminItems; // Only admin gets dashboard
    if (user.role_id === 2) return teacherItems;
    if (user.role_id === 3) return registrarItems;
    if (user.role_id === 4) return studentItems;
    if (user.role_id === 7) return accountantItems;
    return [];
  };

  const menuItems = getMenuItems();
  const sections = [...new Set(menuItems.map(item => item.section))];

  const getRoleName = (roleId) => {
    const roles = { 
      1: 'Administrator', 
      2: 'Teacher', 
      3: 'Registrar', 
      4: 'Student',
      7: 'Accountant'
    };
    return roles[roleId] || 'User';
  };

  return (
    <div className="dashboard-layout">
      {/* Top Header */}
      <header className="top-header">
        <Link 
          to={
            user.role_id === 1 ? "/dashboard" : 
            user.role_id === 4 ? "/my-schedule" : 
            user.role_id === 7 ? "/fees" : 
            "/students"
          } 
          className="header-left" 
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <img src={systemSettings.system_logo} alt="SMS" className="header-logo" />
          <span className="header-title">{systemSettings.system_title}</span>
        </Link>

        <div className="header-right">
          <Link to="/profile" className="user-profile-header" style={{ textDecoration: 'none', color: 'inherit' }}>
            {user.Image ? (
              <img src={user.Image} alt={user.username} className="user-avatar-img" />
            ) : (
              <div className="user-avatar-placeholder" style={{width:'40px',height:'40px',borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',color:'#374151',fontWeight:600}}>
                👤
              </div>
            )}
            <div className="user-info">
              <div className="user-name-header">{user.username}</div>
              <div className="user-role-header">{getRoleName(user.role_id)}</div>
            </div>
            <button className="dropdown-arrow">▼</button>
          </Link>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {sections.map(section => (
              <div key={section} className="nav-section">
                <div className="nav-label">{section}</div>
                {menuItems
                  .filter(item => item.section === section)
                  .map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button onClick={logout} className="logout-btn">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
