import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [passkey, setPasskey] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch(`http://localhost:5000/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        setMsg('Admin login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setMsg(data.msg || 'Login failed');
      }
    } catch (error) {
      setMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="security-badge">🔒 Secure Admin Access</div>
        <div className="admin-login-header">
          <h1>Admin Portal</h1>
          <p>Secure access for administrators</p>
        </div>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="passkey">Admin Passkey</label>
            <input
              id="passkey"
              name="passkey"
              type="password"
              placeholder="Enter admin passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>
        </form>

        {msg && (
          <div className={`admin-login-msg ${msg.includes('successful') ? 'success' : 'error'}`}>
            {msg}
          </div>
        )}

        <div className="admin-login-footer">
          <p>Not an admin? <a href="/login">User Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
