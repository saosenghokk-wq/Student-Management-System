import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function HomeRedirect() {
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    // Get user data from storage
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Redirect based on role_id
        if (user.role_id === 1) {
          // Admin
          setRedirectPath('/dashboard');
        } else if (user.role_id === 2) {
          // Dean
          setRedirectPath('/teachers');
        } else if (user.role_id === 3) {
          // Teacher
          setRedirectPath('/attendance');
        } else if (user.role_id === 4) {
          // Student
          setRedirectPath('/my-schedule');
        } else if (user.role_id === 5) {
          // Parent
          setRedirectPath('/parent-attendance');
        } else if (user.role_id === 7) {
          // Accountant
          setRedirectPath('/fees');
        } else {
          // Default fallback
          setRedirectPath('/students');
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        setRedirectPath('/dashboard');
      }
    } else {
      setRedirectPath('/dashboard');
    }
  }, []);

  if (!redirectPath) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ 
          width: 50, 
          height: 50, 
          border: '4px solid #e5e7eb', 
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <Navigate to={redirectPath} replace />;
}

export default HomeRedirect;
