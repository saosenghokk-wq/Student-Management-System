import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function Settings() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [settings, setSettings] = useState({
    system_title: '',
    system_address: '',
    sys_phone: '',
    system_email: '',
    system_language: 'English',
    system_runnign_year: '',
    system_logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSettings();
      if (response.success && response.data) {
        // Format date to YYYY-MM-DD if it exists
        const data = { ...response.data };
        if (data.system_runnign_year) {
          const date = new Date(data.system_runnign_year);
          if (!isNaN(date.getTime())) {
            data.system_runnign_year = date.toISOString().split('T')[0];
          }
        }
        setSettings(data);
        setPreviewImage(data.system_logo || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setSettings(prev => ({ ...prev, system_logo: base64String }));
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!settings.system_title) {
      showWarning('System title is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.updateSettings(settings);
      
      if (response.success) {
        showSuccess('Settings updated successfully!');
        loadSettings();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showError('Failed to update settings: ' + error.message);
    } finally {
      setSubmitting(false);
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
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '28px',
          position: 'relative'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px 32px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              filter: 'blur(30px)'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1.8rem', 
                fontWeight: '800', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ 
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>⚙️</span>
                System Settings
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                Configure system information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}>
            {/* System Logo Section */}
            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 100%)',
              padding: '24px 32px', 
              borderBottom: '2px solid #e8eaff' 
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#1f2937', 
                fontSize: '1.1rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>🖼️</span>
                System Logo
              </h3>
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  width: '140px',
                  height: '140px',
                  border: '2px dashed #c7d2fe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.1)',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}>
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="System Logo" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }} 
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '3rem', 
                        opacity: 0.2,
                        display: 'block',
                        marginBottom: '4px'
                      }}>🏫</span>
                      <p style={{ 
                        fontSize: '0.7rem', 
                        color: '#9ca3af',
                        margin: 0,
                        fontWeight: '500'
                      }}>No logo</p>
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <label 
                    htmlFor="logo-upload" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>📁</span>
                    Choose Logo
                  </label>
                  <input 
                    id="logo-upload"
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <p style={{ 
                      margin: '0 0 6px 0', 
                      fontSize: '0.8rem', 
                      color: '#4b5563',
                      fontWeight: '600'
                    }}>
                      📋 Upload Guidelines:
                    </p>
                    <ul style={{ 
                      margin: 0,
                      paddingLeft: '18px',
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}>
                      <li>Square image recommended (e.g., 512×512px)</li>
                      <li>Maximum file size: 5MB</li>
                      <li>Supported formats: PNG, JPG, SVG</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '32px' }}>
              <div style={{ 
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.15rem' }}>📝</span>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* System Title */}
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                      System Title
                      <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="system_title"
                      value={settings.system_title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Student Management System"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* System Address */}
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>📍</span>
                      System Address
                    </label>
                    <textarea
                      name="system_address"
                      value={settings.system_address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Full system address..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ 
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.15rem' }}>📞</span>
                  Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Phone */}
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="sys_phone"
                      value={settings.sys_phone}
                      onChange={handleInputChange}
                      placeholder="e.g., 855123456789"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>📧</span>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="system_email"
                      value={settings.system_email}
                      onChange={handleInputChange}
                      placeholder="e.g., info@school.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* System Preferences */}
              <div>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.15rem' }}>🎛️</span>
                  System Preferences
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Language */}
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>🌐</span>
                      System Language
                    </label>
                    <select
                      name="system_language"
                      value={settings.system_language}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="English">🇬🇧 English</option>
                      <option value="Khmer">🇰🇭 Khmer</option>
                    </select>
                  </div>

                  {/* Running Year */}
                  <div>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>📅</span>
                      System Running Date
                    </label>
                    <input
                      type="date"
                      name="system_runnign_year"
                      value={settings.system_runnign_year}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ 
              padding: '24px 32px', 
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 100%)',
              borderTop: '2px solid #e8eaff'
            }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  border: 'none',
                  background: submitting 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: submitting 
                    ? 'none' 
                    : '0 6px 20px rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite' }}>⏳</span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.2rem' }}>✓</span>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
