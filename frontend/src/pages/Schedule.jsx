import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api, API_BASE } from '../api/api';
import { useAlert } from '../contexts/AlertContext';

export default function Schedule() {
  const { showSuccess, showError } = useAlert();
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    batch_id: '',
    semester: '',
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedulesRes, batchesRes] = await Promise.all([
        fetch(`${API_BASE}/api/schedules`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}` }
        }),
        api.getAllBatches()
      ]);
      
      if (!schedulesRes.ok) {
        throw new Error(`Failed to load schedules: ${schedulesRes.status}`);
      }
      
      const schedulesData = await schedulesRes.json();
      setSchedules(schedulesData.data || []);
      setBatches(batchesRes || []);
      setError('');
    } catch (err) {
      console.error('Error loading data:', err);
      showError('Failed to load schedules: ' + err.message);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setForm({ ...form, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.batch_id || !form.semester || !form.image) {
      setError('Please fill all required fields and select an image');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batch_id: form.batch_id,
          semester: form.semester,
          image: form.image
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload schedule');
      }
      
      showSuccess('Schedule uploaded successfully!');
      setShowModal(false);
      setForm({ batch_id: '', semester: '', image: null });
      setImagePreview(null);
      loadData();
    } catch (err) {
      setError('❌ ' + (err.message || 'Failed to upload schedule'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }
      
      showSuccess('Schedule deleted successfully!');
      loadData();
    } catch (err) {
      setError('❌ ' + (err.message || 'Failed to delete schedule'));
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setForm({
      batch_id: schedule.batch_id,
      semester: schedule.semester,
      image: schedule.image
    });
    setImagePreview(schedule.image);
    setError('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!form.batch_id || !form.semester) {
      setError('Please fill all required fields');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/schedules/${editingSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batch_id: form.batch_id,
          semester: form.semester,
          image: form.image
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update schedule');
      }
      
      showSuccess('Schedule updated successfully!');
      setShowEditModal(false);
      setEditingSchedule(null);
      setForm({ batch_id: '', semester: '', image: null });
      setImagePreview(null);
      loadData();
    } catch (err) {
      setError('❌ ' + (err.message || 'Failed to update schedule'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '0 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1f2937', margin: 0, marginBottom: 8 }}>
            📅 Schedule Management
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
            Upload and manage class schedules
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            border: '2px solid #fca5a5', 
            borderRadius: 8, 
            padding: '12px 16px', 
            marginBottom: 20,
            color: '#dc2626',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}
        


        {/* Add Button */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>➕</span> Upload Schedule
          </button>
        </div>

        {/* Schedules List */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 20px rgba(0,0,0,.08)',
          padding: 24
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              Loading schedules...
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              No schedules uploaded yet
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: 24 
            }}>
              {schedules.map(schedule => (
                <div key={schedule.id} style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                >
                  <img 
                    src={schedule.image} 
                    alt="Schedule" 
                    style={{ 
                      width: '100%', 
                      height: 250, 
                      objectFit: 'cover',
                      background: '#f3f4f6',
                      pointerEvents: 'none'
                    }}
                  />
                  <div style={{ padding: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: '#6b7280',
                        fontWeight: 600
                      }}>
                        {schedule.batch_code}
                      </span>
                      <span style={{ 
                        marginLeft: 8,
                        padding: '4px 12px',
                        background: '#e0e7ff',
                        color: '#4f46e5',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        Semester {schedule.semester}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#9ca3af',
                      marginBottom: 12
                    }}>
                      Uploaded: {new Date(schedule.upload_date).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(schedule)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        style={{
                          flex: 1,
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              width: '90%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 24,
                color: 'white'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                  Upload Schedule
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                  Upload schedule image for a batch
                </p>
              </div>
              
              <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    Batch <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={form.batch_id}
                    onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.Id} value={batch.Id}>
                        {batch.batch_code} - {batch.academic_year}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    Semester <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    placeholder="e.g., 1, 2, 3"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    Schedule Image <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px dashed #e5e7eb',
                      borderRadius: 8,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8 }}>
                    JPG, PNG or GIF (max 5MB)
                  </p>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '100%', 
                        marginTop: 12,
                        borderRadius: 8,
                        border: '2px solid #e5e7eb'
                      }}
                    />
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: 12, 
                  justifyContent: 'flex-end',
                  marginTop: 24
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setForm({ batch_id: '', semester: '', image: null });
                      setImagePreview(null);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: '10px 20px',
                      background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  >
                    {uploading ? 'Uploading...' : '✓ Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingSchedule && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              width: '90%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 24,
                color: 'white'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                  ✏️ Edit Schedule
                </h2>
              </div>
              
              <form onSubmit={handleUpdate} style={{ padding: 24 }}>
                {error && (
                  <div style={{ 
                    background: '#fee2e2', 
                    border: '1px solid #fca5a5', 
                    color: '#dc2626', 
                    padding: 12, 
                    borderRadius: 8, 
                    marginBottom: 20,
                    fontSize: '0.9rem'
                  }}>
                    {error}
                  </div>
                )}
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    Batch <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={form.batch_id}
                    onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.Id} value={batch.Id}>
                        {batch.batch_code} - {batch.academic_year}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    Semester <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    placeholder="e.g., 1, 2, 3"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 600,
                    color: '#1f2937'
                  }}>
                    Schedule Image <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ 
                      width: '100%',
                      padding: 10,
                      border: '2px dashed #d1d5db',
                      borderRadius: 8,
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8 }}>
                    JPG, PNG or GIF (max 5MB)
                  </p>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '100%', 
                        marginTop: 12,
                        borderRadius: 8,
                        border: '2px solid #e5e7eb'
                      }}
                    />
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: 12, 
                  justifyContent: 'flex-end',
                  marginTop: 24
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSchedule(null);
                      setForm({ batch_id: '', semester: '', image: null });
                      setImagePreview(null);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '2px solid #d1d5db',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: '10px 20px',
                      background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  >
                    {uploading ? 'Updating...' : '✓ Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
