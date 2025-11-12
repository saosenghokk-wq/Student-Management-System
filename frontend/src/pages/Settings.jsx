import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    system_title: '',
    system_address: '',
    sys_phone: '',
    system_email: '',
    system_language: 'English',
    system_runnign_year: new Date().getFullYear().toString(),
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
        setSettings(response.data);
        setPreviewImage(response.data.system_logo || '');
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
        alert('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
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
      alert('System title is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.updateSettings(settings);
      
      if (response.success) {
        alert('Settings updated successfully!');
        loadSettings();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings: ' + error.message);
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
      <div style={{ padding: '30px 40px', maxWidth: '1000px', margin: '0 auto' }}>
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
            <span style={{ fontSize: '2rem' }}>⚙️</span>
            System Settings
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            color: '#64748b',
            fontWeight: '500'
          }}>
            Configure system information and preferences
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #f3f4f6'
          }}>
            {/* System Logo Section */}
            <div style={{ 
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
              padding: '24px 32px', 
              borderBottom: '2px solid #e5e7eb' 
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#1f2937', 
                fontSize: '1.2rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.3rem' }}>🖼️</span>
                System Logo
              </h3>
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{
                  width: '150px',
                  height: '150px',
                  border: '3px dashed #e5e7eb',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  overflow: 'hidden'
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
                    <span style={{ fontSize: '3rem', opacity: 0.3 }}>🏫</span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <label 
                    htmlFor="logo-upload" 
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    📁 Choose Logo
                  </label>
                  <input 
                    id="logo-upload"
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <p style={{ 
                    margin: '12px 0 0 0', 
                    fontSize: '0.85rem', 
                    color: '#6b7280' 
                  }}>
                    Recommended: Square image, max 5MB (PNG, JPG, or SVG)
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* System Title */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}>
                    System Title *
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
                      fontSize: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* System Address */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}>
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
                      fontSize: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Two Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Phone */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="number"
                      name="sys_phone"
                      value={settings.sys_phone}
                      onChange={handleInputChange}
                      placeholder="e.g., 855123456789"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      Email
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
                        fontSize: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Two Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Language */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      System Language
                    </label>
                    <select
                      name="system_language"
                      value={settings.system_language}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="English">English</option>
                      <option value="Khmer">Khmer</option>
                    </select>
                  </div>

                  {/* Running Year */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '0.95rem'
                    }}>
                      Academic Year
                    </label>
                    <input
                      type="date"
                      name="system_runnign_year"
                      value={settings.system_runnign_year}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ 
              padding: '24px 32px', 
              background: '#f9fafb',
              borderTop: '2px solid #e5e7eb'
            }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  border: 'none',
                  background: submitting 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting 
                    ? 'none' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !submitting && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? '💾 Saving...' : '✓ Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
