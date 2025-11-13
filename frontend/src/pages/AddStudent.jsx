import React, { useState } from 'react';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAlert } from '../contexts/AlertContext';
import '../styles/table.css';

export default function AddStudent() {
  const { showSuccess, showError } = useAlert();
  const [form, setForm] = useState({
    user_id: '',
    std_eng_name: '',
    std_khmer_name: '',
    dob: '',
    gender: '0',
    phone: '',
  });
  const navigate = useNavigate();

  const change = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, user_id: parseInt(form.user_id, 10) };
      const created = await api.createStudent(payload);
      showSuccess(`Student created with id ${created.id}`);
      setTimeout(() => navigate('/students'), 1000);
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Add New Student</h1>
            <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b' }}>Create a new student record in the system</p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ padding: 24 }}>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>User ID</label>
                  <input name="user_id" value={form.user_id} onChange={change} required placeholder="Enter user ID" />
                </div>
                
                <div className="form-field">
                  <label>English Name</label>
                  <input name="std_eng_name" value={form.std_eng_name} onChange={change} required placeholder="Enter English name" />
                </div>
                
                <div className="form-field">
                  <label>Khmer Name</label>
                  <input name="std_khmer_name" value={form.std_khmer_name} onChange={change} placeholder="Enter Khmer name" />
                </div>
                
                <div className="form-field">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={form.dob} onChange={change} required />
                </div>
                
                <div className="form-field">
                  <label>Gender</label>
                  <select name="gender" value={form.gender} onChange={change}>
                    <option value="0">Male</option>
                    <option value="1">Female</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={change} placeholder="Enter phone number" />
                </div>
              </div>
              
              <div style={{ marginTop: 24 }}>
                <button type="submit" className="btn btn-submit" style={{ width: '100%', padding: '12px' }}>Create Student</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
