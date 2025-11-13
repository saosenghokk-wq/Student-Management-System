import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/profile.css';

export default function Profile() {
  const { showSuccess, showError, showWarning } = useAlert();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    Image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      
      // If user is a student, redirect to their student profile detail page
      if (userData.role_id === 4 && userData.student_id) {
        navigate(`/students/${userData.student_id}`);
        return;
      }
      
      loadUserProfile();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      const response = await api.getProfile();
      const userData = response.user;
      
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        Image: userData.Image || ''
      });
      
      // Image is now base64 data, use it directly
      if (userData.Image) {
        setImagePreview(userData.Image);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    }
  };

  // Inputs are read-only; keep handler only if needed in future

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    setLoading(true);
    try {
      await api.deleteProfileImage();
      setImagePreview(null);
      setSelectedFile(null);
      setFormData(prev => ({ ...prev, Image: '' }));
      setMessage({ type: 'success', text: 'Profile image removed successfully!' });
      
      // Update localStorage
      const updatedUser = { ...user, Image: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to remove image' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image to upload' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profile_image', selectedFile);

      const response = await api.updateProfile(formDataToSend);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update localStorage
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Clear selected file
      setSelectedFile(null);
      
      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          {/* Profile Image Section */}
          <div className="profile-image-section">
            <div className="image-upload-card">
              <div className="current-image">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <span className="placeholder-icon">👤</span>
                  </div>
                )}
              </div>
              
              <div className="image-upload-info">
                <h3>Profile Picture</h3>
                <p>Upload a photo to personalize your account</p>
                <div className="image-requirements">
                  <p>• JPG, PNG or GIF</p>
                  <p>• Max size: 5MB</p>
                  <p>• Recommended: 400x400px</p>
                </div>
                
                {/* Hide image upload controls for dean (2), teacher (3), and parent (5) */}
                {user.role_id !== 2 && user.role_id !== 3 && user.role_id !== 5 && (
                  <>
                    <label htmlFor="image-upload" className="upload-btn">
                      📷 Choose Image
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    
                    {formData.Image && (
                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={handleDeleteImage}
                      >
                        🗑️ Remove Image
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="profile-form-section">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      readOnly
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Account Information</h3>
                
                <div className="info-card">
                  <div className="info-item">
                    <span className="info-label">User ID:</span>
                    <span className="info-value">{user.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Role:</span>
                    <span className="info-value">
                      {user.role_id === 1 ? 'Administrator' : 
                       user.role_id === 2 ? 'Teacher' : 
                       user.role_id === 3 ? 'Registrar' : 'Student'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Status:</span>
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
              </div>

              {/* Hide form action buttons for dean (2), teacher (3), and parent (5) */}
              {user.role_id !== 2 && user.role_id !== 3 && user.role_id !== 5 && (
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                    Back to Dashboard
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading || !selectedFile}>
                    {loading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
