import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../api/api';

// Define which roles can access which routes
const ROUTE_PERMISSIONS = {
  // Admin only routes
  '/users': [1],
  '/departments': [1, 3],
  '/programs': [1, 3],
  '/subjects': [1, 3],
  '/batches': [1, 3],
  '/admissions': [1, 3],
  '/subject-enrollment': [1, 3],
  '/staff': [1, 3],
  
  // Admin, Teacher, Registrar
  '/parents': [1, 3],
  '/students': [1, 2, 3],
  '/teachers': [1, 3],
  
  // Admin, Teacher
  '/attendance': [1, 2],
  '/grades': [1, 2],
  
  // Admin and Accountant
  '/fees': [1, 7],
  '/reports': [1],
  '/settings': [1],
  '/dashboard': [1], // Only admin can access dashboard
  
  // Admin and Teacher
  '/schedule': [1, 2],
  
  // Student only
  '/my-schedule': [4],
  '/my-profile': [4],
  '/my-grades': [4],
  '/my-attendance': [4],
  '/my-fees': [4],
  
  // Profile is accessible to all
  '/profile': [1, 2, 3, 4, 7],
};

function RoleProtectedRoute({ children, allowedRoles }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, [location.pathname]);

  const checkAccess = async () => {
    try {
      // Check both sessionStorage and localStorage for token
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if session has expired
      const expiresAt = sessionStorage.getItem('session_expires') || localStorage.getItem('session_expires');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        console.log('Session expired');
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_expires');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Get user data
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (!userStr) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      setIsAuthenticated(true);

      // Check route permissions
      const currentPath = location.pathname;
      
      // Check if it's a dynamic route (e.g., /students/123)
      let routeKey = currentPath;
      
      // Handle dynamic routes
      if (currentPath.startsWith('/students/')) {
        // Special case: Students can view their own profile
        if (user.role_id === 4 && user.student_id) {
          const studentId = currentPath.split('/students/')[1];
          if (studentId == user.student_id) {
            // Student viewing their own profile - allow
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }
        }
        routeKey = '/students';
      } else if (currentPath.startsWith('/attendance/student/')) {
        routeKey = '/attendance';
      } else if (currentPath.startsWith('/grades/student/')) {
        routeKey = '/grades';
      }

      // If route has specific permissions defined, check them
      if (ROUTE_PERMISSIONS[routeKey]) {
        const allowedRoleIds = ROUTE_PERMISSIONS[routeKey];
        if (allowedRoleIds.includes(user.role_id)) {
          setIsAuthorized(true);
        } else {
          console.log(`Access denied: User role ${user.role_id} not allowed for ${routeKey}`);
          setIsAuthorized(false);
        }
      } else {
        // If no specific permissions defined, allow access (for backward compatibility)
        setIsAuthorized(true);
      }

    } catch (err) {
      console.error('Access check error:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        <div>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div>Checking access...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show page not found if not authorized
  if (!isAuthorized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        background: '#f9fafb'
      }}>
        <div style={{ fontSize: '120px', fontWeight: 'bold', color: '#667eea' }}>404</div>
        <h1 style={{ color: '#1f2937', fontSize: '2rem', margin: 0, fontWeight: '700' }}>Page Not Found</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center', maxWidth: '500px' }}>
          The page you are looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => {
            const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              // Redirect based on role
              if (user.role_id === 1) {
                window.location.href = '/dashboard';
              } else if (user.role_id === 4) {
                window.location.href = '/my-schedule';
              } else if (user.role_id === 7) {
                window.location.href = '/fees';
              } else {
                window.location.href = '/students';
              }
            } else {
              window.location.href = '/';
            }
          }}
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  // Render protected content if authorized
  return children;
}

export default RoleProtectedRoute;
