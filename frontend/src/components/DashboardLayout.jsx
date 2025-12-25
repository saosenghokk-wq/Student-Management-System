import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';
import { api } from '../api/api';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [systemSettings, setSystemSettings] = useState({
    system_title: 'Student Management System',
    system_logo: '/Picture1.jpg'
  });

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on mobile after navigation
  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(false);
    }
  }, [location.pathname, isMobile]);

  // Dropdown state management with localStorage persistence
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('expandedSections');
    return saved ? JSON.parse(saved) : {};
  });

  // Save expanded sections to localStorage
  useEffect(() => {
    localStorage.setItem('expandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Toggle section expand/collapse
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      // Academic Management
      { path: '/admissions', label: 'Admissions', icon: '🎓', section: 'academic' },
      { path: '/departments', label: 'Departments', icon: '🏢', section: 'academic' },
      { path: '/programs', label: 'Programs', icon: '📚', section: 'academic' },
      { path: '/batches', label: 'Batches', icon: '📚', section: 'academic' },
      { path: '/subjects', label: 'Subjects', icon: '📖', section: 'academic' },
      { path: '/subject-enrollment', label: 'Subject Enrollment', icon: '📝', section: 'academic' },
      { path: '/schedule', label: 'Class Schedule', icon: '📅', section: 'academic' },
      // Personnel Management
      { path: '/users', label: 'System Users', icon: '👤', section: 'personnel' },
      { path: '/staff', label: 'Deans', icon: '👔', section: 'personnel' },
      { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', section: 'personnel' },
      { path: '/parents', label: 'Parents', icon: '👨‍👩‍👧', section: 'personnel' },
      { path: '/students', label: 'Students', icon: '👥', section: 'personnel' },
      // Operations & Reports
      { path: '/attendance', label: 'Attendance', icon: '📋', section: 'operations' },
      { path: '/grades', label: 'Grades', icon: '📊', section: 'operations' },
      { path: '/fees', label: 'Fees Management', icon: '💰', section: 'operations' },
      { path: '/reports', label: 'Reports', icon: '📈', section: 'operations' },
      { path: '/generate-card', label: 'Student ID Cards', icon: '🎴', section: 'operations' },
      // System Configuration
      { path: '/settings', label: 'System Settings', icon: '⚙️', section: 'system' },
    ];

    const teacherItems = [
      { path: '/attendance', label: 'Attendance', icon: '📋', section: 'teaching' },
      { path: '/grades', label: 'Grades', icon: '📊', section: 'teaching' },
    ];

    const deanItems = [
      { path: '/programs', label: 'Programs', icon: '📚', section: 'academic' },
      { path: '/batches', label: 'Batches', icon: '📚', section: 'academic' },
      { path: '/subjects', label: 'Subjects', icon: '📖', section: 'academic' },
      { path: '/subject-enrollment', label: 'Subject Enrollment', icon: '📝', section: 'academic' },
      { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', section: 'personnel' },
      { path: '/students', label: 'Students', icon: '👥', section: 'personnel' },
    ];

    const registrarItems = [
      { path: '/admissions', label: 'Admissions', icon: '🎓', section: 'academic' },
      { path: '/departments', label: 'Departments', icon: '🏢', section: 'academic' },
      { path: '/programs', label: 'Programs', icon: '📚', section: 'academic' },
      { path: '/batches', label: 'Batches', icon: '📚', section: 'academic' },
      { path: '/subjects', label: 'Subjects', icon: '📖', section: 'academic' },
      { path: '/subject-enrollment', label: 'Subject Enrollment', icon: '📝', section: 'academic' },
      { path: '/staff', label: 'Deans', icon: '👔', section: 'personnel' },
      { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', section: 'personnel' },
      { path: '/parents', label: 'Parents', icon: '👨‍👩‍👧', section: 'personnel' },
      { path: '/students', label: 'Students', icon: '👥', section: 'personnel' },
      { path: '/generate-card', label: 'Student ID Cards', icon: '🎴', section: 'operations' },
    ];

    const studentItems = [
      { path: '/my-schedule', label: 'My Schedule', icon: '📅', section: 'personal' },
      { path: '/my-grades', label: 'My Grades', icon: '📊', section: 'personal' },
      { path: '/my-attendance', label: 'My Attendance', icon: '📋', section: 'personal' },
      { path: '/my-fees', label: 'My Fees', icon: '💰', section: 'personal' },
    ];

    const parentItems = [
      { path: '/parent-attendance', label: 'Attendance', icon: '📋', section: 'children' },
      { path: '/parent-grades', label: 'Grades', icon: '📊', section: 'children' },
      { path: '/parent-fees', label: 'Fees', icon: '💰', section: 'children' },
    ];

    const accountantItems = [
      { path: '/fees', label: 'Fees', icon: '💰', section: 'operations' },
    ];

    if (user.role_id === 1) return adminItems; // Only admin gets dashboard
    if (user.role_id === 2) return deanItems; // Dean
    if (user.role_id === 3) return teacherItems; // Teacher
    if (user.role_id === 4) return studentItems;
    if (user.role_id === 5) return parentItems; // Parent
    if (user.role_id === 7) return accountantItems;
    return registrarItems; // Default for other roles
  };

  const menuItems = getMenuItems();
  const sections = [...new Set(menuItems.map(item => item.section))];

  // Section display names
  const sectionLabels = {
    'main': 'Dashboard',
    'academic': 'Academic Management',
    'personnel': 'Personnel Management',
    'operations': 'Operations & Reports',
    'teaching': 'Teaching Tools',
    'personal': 'My Information',
    'children': 'Children Information',
    'system': 'System Configuration'
  };

  const getRoleName = (roleId) => {
    const roles = { 
      1: 'Administrator', 
      2: 'Dean', 
      3: 'Teacher',
      4: 'Student',
      5: 'Parent',
      7: 'Accountant'
    };
    return roles[roleId] || 'User';
  };

  return (
    <div className="dashboard-layout">
      {/* Top Header */}
      <header className="top-header">
        {isMobile && (
          <button 
            className="hamburger-btn" 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        {!isMobile && (
          <button 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: '#fff',
              fontSize: '1.3rem',
              cursor: 'pointer',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              transition: 'all 0.2s',
              marginRight: '12px',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              fontWeight: '600',
              width: '44px',
              height: '44px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
            }}
            title={isSidebarVisible ? 'Hide Menu' : 'Show Menu'}
          >
            ☰
          </button>
        )}
        <Link 
          to={
            user.role_id === 1 ? "/dashboard" : 
            user.role_id === 2 ? "/teachers" :
            user.role_id === 3 ? "/attendance" :
            user.role_id === 4 ? "/my-schedule" :
            user.role_id === 5 ? "/parent-attendance" :
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
        {isMobile && isSidebarVisible && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setIsSidebarVisible(false)}
          />
        )}
        <aside 
          className={`sidebar ${!isSidebarVisible ? 'sidebar-hidden' : ''} ${isMobile ? 'sidebar-mobile' : ''}`}
          ref={sidebarRef}
        >
          <nav className="sidebar-nav">
            {user.role_id === 1 ? (
              // Admin - Dropdown menu with collapsible sections
              sections.map(section => {
                const sectionItems = menuItems.filter(item => item.section === section);
                const isExpanded = expandedSections[section] !== false; // Default to expanded
                
                return (
                  <div key={section} className="nav-section">
                    <div 
                      className="nav-section-header" 
                      onClick={() => toggleSection(section)}
                    >
                      <span>{sectionLabels[section] || section}</span>
                      <span style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </span>
                    </div>
                    
                    <div 
                      className="nav-section-content"
                      style={{
                        maxHeight: isExpanded ? `${sectionItems.length * 52}px` : '0',
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
                        transitionProperty: 'max-height, opacity, transform'
                      }}
                    >
                      {sectionItems.map(item => (
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
                  </div>
                );
              })
            ) : (
              // Other roles - Flat menu list
              sections.map(section => (
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
              ))
            )}
          </nav>

          <div className="sidebar-footer">
            <button onClick={logout} className="logout-btn">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main 
          className="main-content"
          style={{
            marginLeft: isSidebarVisible ? '260px' : '0',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
