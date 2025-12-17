import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function MySchedule() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.getMySchedules();
      if (response.success) {
        setSchedules(response.data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      alert('Failed to load schedules: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
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
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading your schedules...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '2rem', 
            fontWeight: '800', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '2rem' }}>📅</span>
            My Class Schedule
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            color: '#64748b',
            fontWeight: '500'
          }}>
            View your class schedules for all semesters
          </p>
        </div>

        {/* Schedules Grid */}
        {schedules.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>📭</div>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#374151' 
            }}>
              No Schedules Available
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '1rem', 
              color: '#6b7280' 
            }}>
              There are no schedules uploaded for your batch yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '2px solid #f3f4f6',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onClick={() => handleViewSchedule(schedule)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#f3f4f6';
                }}
              >
                {/* Schedule Image */}
                <div style={{
                  width: '100%',
                  height: '250px',
                  background: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={schedule.image}
                    alt={`Schedule for ${schedule.semester}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Schedule Info */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    marginBottom: '12px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    {schedule.semester}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.95rem',
                      color: '#4b5563'
                    }}>
                      <span>🎓</span>
                      <strong>Batch:</strong> {schedule.batch_code}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.95rem',
                      color: '#4b5563'
                    }}>
                      <span>📚</span>
                      <strong>Year:</strong> {schedule.academic_year}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      <span>📅</span>
                      <strong>Uploaded:</strong> {new Date(schedule.upload_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <button
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span>👁️</span> View Full Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing full schedule */}
      {showModal && selectedSchedule && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '90vw',
              height: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                  {selectedSchedule.semester}
                </h2>
                <div style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: '500' }}>
                  {selectedSchedule.batch_code} - {selectedSchedule.academic_year}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '1.5rem',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  fontWeight: '400',
                  lineHeight: '1'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body - Image */}
            <div style={{
              flex: 1,
              overflow: 'hidden',
              background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)',
              padding: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={selectedSchedule.image}
                alt={`Schedule for ${selectedSchedule.semester}`}
                style={{
                  width: '685px',
                  height: '600px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 32px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafbfc'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                📅 Uploaded: {new Date(selectedSchedule.upload_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
