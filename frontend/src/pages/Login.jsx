import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import '../styles/auth.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved username if remember me was checked
    const savedUser = localStorage.getItem('remember_username');
    if (savedUser) setForm((f) => ({ ...f, username: savedUser }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ ...form, rememberMe: remember });
      
      // Store token and user data
      if (remember) {
        // Remember me: use localStorage (persists after browser close)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('remember_username', form.username);
        localStorage.setItem('remember_session', 'true');
        localStorage.setItem('session_expires', Date.now() + data.expiresIn);
      } else {
        // Don't remember: use sessionStorage (clears when browser closes)
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('session_expires', Date.now() + data.expiresIn);
        
        // Clear any previous remember settings
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('remember_username');
        localStorage.removeItem('remember_session');
        localStorage.removeItem('session_expires');
      }
      
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/Picture1.jpg" alt="logo" className="brand-logo" />
          <h1>Welcome back</h1>
          <p>Please sign in to continue</p>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <span className="error-dot" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="auth-form" noValidate>
          <div className="input-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              name="username"
              placeholder="you@example.com"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="row between">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="link" disabled>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !form.username || !form.password}
          >
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="footer-note">
          Tip: New students should register at the student center.
        </div>
      </div>
    </div>
  );
}
