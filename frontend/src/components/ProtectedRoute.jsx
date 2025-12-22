import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/api';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthentication = useCallback(async () => {
    try {
      // Check both sessionStorage and localStorage for token
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        // No token found
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

      // Verify token is still valid by making a request
      try {
        // Try to fetch user profile to verify token
        await api.getProfile();
        setIsAuthenticated(true);
      } catch (err) {
        // Token is invalid or expired
        console.log('Token validation failed:', err.message);
        
        // Clear all session data
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_expires');
        
        // Keep remember_username if remember_session is enabled
        const rememberSession = localStorage.getItem('remember_session');
        if (!rememberSession) {
          localStorage.removeItem('remember_username');
        }
        
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Authentication check error:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Show loading while checking authentication
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
          <div>Checking session...</div>
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

  // Render protected content if authenticated
  return children;
}

export default ProtectedRoute;
