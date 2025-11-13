import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

export default function ParentAttendance() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      loadChildren();
    } else {
      setLoading(false);
    }
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getMyChildren();
      setChildren(data || []);
    } catch (err) {
      console.error('Error loading children:', err);
      setError(err.message || 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '20px' }}>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <h1>📋 Children Attendance</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Select a child to view their attendance records
          </p>
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {children.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>�</div>
            <h2 style={{ color: '#1f2937', marginBottom: '12px' }}>No Children Found</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              No students are linked to your parent account.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px',
            padding: '10px 0'
          }}>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => navigate(`/parent-attendance/student/${child.id}/classes`)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                {child.Image ? (
                  <img 
                    src={child.Image} 
                    alt={child.std_eng_name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid white',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    border: '4px solid white'
                  }}>
                    👤
                  </div>
                )}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {child.std_eng_name}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.95 }}>
                    {child.std_khmer_name}
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    marginTop: '8px', 
                    opacity: 0.85,
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    {child.student_code}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
