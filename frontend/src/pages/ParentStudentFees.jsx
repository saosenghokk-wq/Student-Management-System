import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function ParentStudentFees() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total_payments: 0, total_paid: 0 });
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudentInfo = useCallback(async () => {
    try {
      const children = await api.getMyChildren();
      const child = children.find(c => c.id.toString() === studentId);
      if (child) {
        setStudent(child);
      } else {
        showError('Student not found or not linked to your account');
        navigate('/parent-fees');
      }
    } catch (error) {
      console.error('Error loading student info:', error);
      showError('Failed to load student information');
    }
  }, [studentId, showError, navigate]);

  const loadFeePayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getStudentFeePayments(studentId);
      if (response.success) {
        setPayments(response.data.payments);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading fee payments:', error);
      showError('Failed to load fee payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [studentId, showError]);

  useEffect(() => {
    loadStudentInfo();
    loadFeePayments();
  }, [loadStudentInfo, loadFeePayments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // const balance = stats.total_payments - stats.total_paid;

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
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading fee payments...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/parent-fees')}
          style={{
            background: 'transparent',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.color = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#374151';
          }}
        >
          ← Back to Children List
        </button>

        {/* Student Header */}
        {student && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            color: '#fff',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {student.Image ? (
              <img 
                src={student.Image} 
                alt={student.std_eng_name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                border: '4px solid rgba(255, 255, 255, 0.3)'
              }}>
                👤
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '2rem', 
                fontWeight: '800'
              }}>
                {student.std_eng_name}
              </h1>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1.1rem',
                opacity: 0.95
              }}>
                {student.std_khmer_name}
              </p>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {student.student_code}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '1.8rem', 
            fontWeight: '800', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.8rem' }}>💰</span>
            Fee Payment Details
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            color: '#64748b',
            fontWeight: '500'
          }}>
            View fee payment history and balance information
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
              {formatCurrency(stats.total_payments)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.95, fontWeight: '600' }}>
              Total Fees
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
              {formatCurrency(stats.total_paid)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.95, fontWeight: '600' }}>
              Total Paid
            </div>
          </div>
        </div>

        {/* Payment History */}
        {payments.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>💳</div>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#374151' 
            }}>
              No Payment Records
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '1rem', 
              color: '#6b7280' 
            }}>
              No fee payments have been recorded yet.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
              padding: '24px 32px', 
              borderBottom: '2px solid #e5e7eb' 
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#1f2937', 
                fontSize: '1.3rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📜</span>
                Payment History ({payments.length} {payments.length === 1 ? 'payment' : 'payments'})
              </h3>
            </div>

            <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Payment Icon */}
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}>
                      💵
                    </div>

                    {/* Payment Details */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: '800',
                          color: '#10b981'
                        }}>
                          {formatCurrency(payment.amount)}
                        </span>
                        <span style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: '2px solid #93c5fd',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {payment.payment_method}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        <span>📅 {formatDate(payment.pay_date)}</span>
                        {payment.made_by_name && (
                          <span>👤 Processed by {payment.made_by_name}</span>
                        )}
                      </div>
                      {payment.description && (
                        <div style={{
                          background: '#fef3c7',
                          border: '2px solid #fcd34d',
                          borderRadius: '8px',
                          padding: '12px',
                          marginTop: '12px'
                        }}>
                          <span style={{
                            fontSize: '0.85rem',
                            color: '#92400e',
                            fontWeight: '600'
                          }}>
                            <strong>Description:</strong> {payment.description}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Payment Date Time */}
                    <div style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center',
                      minWidth: '100px'
                    }}>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#6b7280',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        RECORDED
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#1f2937',
                        fontWeight: '700'
                      }}>
                        {new Date(payment.pay_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
