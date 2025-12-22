import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import '../styles/table.css';

export default function ParentFees() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [childrenFees, setChildrenFees] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) {
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
      
      // Load fee stats for each child
      const feesPromises = data.map(child => 
        api.getStudentFeePayments(child.id).then(res => ({
          studentId: child.id,
          stats: res.data?.stats || { total_payments: 0, total_paid: 0 }
        })).catch(() => ({
          studentId: child.id,
          stats: { total_payments: 0, total_paid: 0 }
        }))
      );
      
      const feesData = await Promise.all(feesPromises);
      const feesMap = {};
      feesData.forEach(item => {
        feesMap[item.studentId] = item.stats;
      });
      setChildrenFees(feesMap);
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading children fee information...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <h1 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '2rem',
            fontWeight: '800',
            color: '#1f2937',
            margin: '0 0 12px 0'
          }}>
            <span style={{ fontSize: '2rem' }}>💰</span>
            Children Fees
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '1rem' }}>
            Select a child to view their fee payment history and status
          </p>
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {children.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍👩‍👧</div>
            <h2 style={{ color: '#1f2937', marginBottom: '12px' }}>No Children Found</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              No students are linked to your parent account.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px',
            padding: '10px 0'
          }}>
            {children.map((child) => {
              const feeStats = childrenFees[child.id] || { total_payments: 0, total_paid: 0 };
              const balance = feeStats.total_payments - feeStats.total_paid;
              const isPaidFull = balance <= 0;

              return (
                <div
                  key={child.id}
                  onClick={() => navigate(`/parent-fees/student/${child.id}`)}
                  style={{
                    background: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '20px',
                    padding: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: isPaidFull 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : balance > 0 
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}>
                    {isPaidFull ? '✓ Paid' : balance > 0 ? '⚠ Pending' : 'No Fees'}
                  </div>

                  {/* Student Info */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    {child.Image ? (
                      <img 
                        src={child.Image} 
                        alt={child.std_eng_name}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '4px solid #f3f4f6',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          marginBottom: '16px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        border: '4px solid #f3f4f6',
                        marginBottom: '16px'
                      }}>
                        👤
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        marginBottom: '4px',
                        color: '#1f2937'
                      }}>
                        {child.std_eng_name}
                      </div>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        {child.std_khmer_name}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem',
                        color: '#9ca3af',
                        background: '#f9fafb',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        {child.student_code}
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div style={{ marginTop: '20px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                      View Full Details →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
