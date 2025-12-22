import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

// Searchable Select Component
function SearchableSelect({ options, value, onChange, placeholder, disabled, labelKey, valueKey, searchKeys }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = options.find(opt => opt[valueKey] === value);
  
  const filteredOptions = searchTerm
    ? options.filter(opt => 
        searchKeys.some(key => 
          String(opt[key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : options;

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: '' } });
    setSearchTerm('');
  };

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 40px 10px 14px',
          fontSize: '0.875rem',
          border: isOpen ? '2px solid #3b82f6' : '1px solid #d1d5db',
          borderRadius: '8px',
          background: disabled ? '#f9fafb' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '42px',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <span style={{ 
          color: selectedOption ? '#111827' : '#9ca3af',
          fontWeight: selectedOption ? '500' : '400',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          marginRight: '8px'
        }}>
          {selectedOption ? selectedOption[labelKey] : placeholder}
        </span>
        <span style={{ 
          position: 'absolute', 
          right: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}>
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
              }}
              title="Clear selection"
            >
              ×
            </button>
          )}
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
            style={{
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <path d="M2 4L6 8L10 4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      
      {isOpen && !disabled && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.05)'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
            maxHeight: '320px',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease-out'
          }}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderBottom: '1px solid #e5e7eb',
              padding: '10px 12px',
              zIndex: 1
            }}>
              <div style={{ position: 'relative' }}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.5"/>
                  <path d="M11 11L14 14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.875rem',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div style={{ 
              maxHeight: '250px', 
              overflowY: 'auto',
              padding: '4px'
            }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div
                    key={opt[valueKey]}
                    onClick={() => handleSelect(opt[valueKey])}
                    style={{
                      padding: '10px 14px',
                      margin: '2px 0',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      background: opt[valueKey] === value ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
                      color: opt[valueKey] === value ? '#1e40af' : '#374151',
                      fontWeight: opt[valueKey] === value ? '600' : '400',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      if (opt[valueKey] !== value) {
                        e.target.style.background = '#f9fafb';
                        e.target.style.paddingLeft = '18px';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (opt[valueKey] !== value) {
                        e.target.style.background = 'transparent';
                        e.target.style.paddingLeft = '14px';
                      }
                    }}
                  >
                    <span>{opt[labelKey]}</span>
                    {opt[valueKey] === value && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6.5 11.5L13 5" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '24px 14px', 
                  textAlign: 'center',
                  color: '#9ca3af', 
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                  No results found
                </div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export default function AddParent() {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    parent_code: '',
    mother_name: '',
    mother_occupation: '',
    mother_phone: '',
    mother_status: 'alive',
    father_name: '',
    father_occupation: '',
    father_phone: '',
    father_status: 'alive',
    province_no: '',
    district_no: '',
    commune_no: '',
    village_no: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);

  const loadInitialData = useCallback(async () => {
    try {
      const [provs, parents] = await Promise.all([
        api.getProvinces(),
        api.getParents()
      ]);
      setProvinces(provs || []);
      
      // Generate parent code: P + (parent count + 1)
      const parentCount = Array.isArray(parents) ? parents.length : (parents?.data?.length || 0);
      const newParentCode = `P${String(parentCount + 1).padStart(3, '0')}`;
      setForm(prev => ({ ...prev, parent_code: newParentCode }));
    } catch (err) {
      showError('Failed to load initial data');
    }
  }, [showError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = async (e) => {
    const no = e.target.value;
    setForm(prev => ({ ...prev, province_no: no, district_no: '', commune_no: '', village_no: '' }));
    setDistricts([]);
    setCommunes([]);
    setVillages([]);
    if (no) {
      try {
        const data = await api.getDistricts(no);
        setDistricts(data || []);
      } catch (err) {
        showError('Failed to load districts');
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const no = e.target.value;
    setForm(prev => ({ ...prev, district_no: no, commune_no: '', village_no: '' }));
    setCommunes([]);
    setVillages([]);
    if (no) {
      try {
        const data = await api.getCommunes(no);
        setCommunes(data || []);
      } catch (err) {
        showError('Failed to load communes');
      }
    }
  };

  const handleCommuneChange = async (e) => {
    const no = e.target.value;
    setForm(prev => ({ ...prev, commune_no: no, village_no: '' }));
    setVillages([]);
    if (no) {
      try {
        const data = await api.getVillages(no);
        setVillages(data || []);
      } catch (err) {
        showError('Failed to load villages');
      }
    }
  };

  const handleVillageChange = (e) => {
    setForm(prev => ({ ...prev, village_no: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createParent(form);
      showSuccess('Parent created successfully');
      setTimeout(() => navigate('/parents'), 1000);
    } catch (err) {
      showError(err.message || 'Failed to create parent');
    }
  };

  return (
    <DashboardLayout>
      <div className="page" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
            👨‍👩‍👧‍👦 Add New Parent
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Fill in the information below to create a new parent record</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Account Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔐</span> Account Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Username <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="username" 
                      value={form.username} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Enter username"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="name@example.com"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="password" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Enter password"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Parent Code */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🪪</span> Parent Code
                </h3>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Parent Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    name="parent_code" 
                    value={form.parent_code} 
                    onChange={handleChange} 
                    required 
                    readOnly
                    className="form-input" 
                    placeholder="Auto-generated"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem', background: '#f9fafb', cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                    💡 Parent code is automatically generated (P + parent count)
                  </p>
                </div>
              </div>

              {/* Mother Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👩</span> Mother Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Mother Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="mother_name" 
                      value={form.mother_name} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Full name"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Occupation
                    </label>
                    <input 
                      name="mother_occupation" 
                      value={form.mother_occupation} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Occupation"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Phone <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="mother_phone" 
                      value={form.mother_phone} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Phone number"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Status <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="mother_status" 
                      value={form.mother_status} 
                      onChange={handleChange} 
                      required 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="alive">Alive</option>
                      <option value="deceased">Deceased</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Father Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👨</span> Father Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Father Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      name="father_name" 
                      value={form.father_name} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Full name"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Occupation
                    </label>
                    <input 
                      name="father_occupation" 
                      value={form.father_occupation} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Occupation"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Phone <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="father_phone" 
                      value={form.father_phone} 
                      onChange={handleChange} 
                      required 
                      className="form-input" 
                      placeholder="Phone number"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Status <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="father_status" 
                      value={form.father_status} 
                      onChange={handleChange} 
                      required 
                      className="form-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                    >
                      <option value="alive">Alive</option>
                      <option value="deceased">Deceased</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📍</span> Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Province
                    </label>
                    <SearchableSelect
                      options={provinces}
                      value={form.province_no}
                      onChange={handleProvinceChange}
                      placeholder="Select Province"
                      labelKey="province_name"
                      valueKey="province_no"
                      searchKeys={['province_name', 'province_no']}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      District
                    </label>
                    <SearchableSelect
                      options={districts}
                      value={form.district_no}
                      onChange={handleDistrictChange}
                      placeholder="Select District"
                      disabled={!form.province_no}
                      labelKey="district_name"
                      valueKey="district_no"
                      searchKeys={['district_name', 'district_no']}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Commune
                    </label>
                    <SearchableSelect
                      options={communes}
                      value={form.commune_no}
                      onChange={handleCommuneChange}
                      placeholder="Select Commune"
                      disabled={!form.district_no}
                      labelKey="commune_name"
                      valueKey="commune_no"
                      searchKeys={['commune_name', 'commune_no']}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Village
                    </label>
                    <SearchableSelect
                      options={villages}
                      value={form.village_no}
                      onChange={handleVillageChange}
                      placeholder="Select Village"
                      disabled={!form.commune_no}
                      labelKey="village_name"
                      valueKey="village_no"
                      searchKeys={['village_name', 'village_no']}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div style={{ 
            position: 'sticky',
            bottom: 0,
            background: 'white',
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            display: 'flex', 
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/parents')} 
              className="btn btn-cancel"
              style={{ 
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '120px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-submit"
              style={{ 
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '120px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              ✓ Create Parent
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
