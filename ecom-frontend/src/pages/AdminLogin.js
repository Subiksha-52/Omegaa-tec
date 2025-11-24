import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import api from '../api';

const AdminLogin = () => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passkey) {
      setError('Please enter the admin passkey');
      return;
    }

    setLoading(true);
    try {
      // Call backend endpoint to validate passkey and get token
      const response = await api.post('/api/auth/admin-login', { passkey });
      
      if (response.data.success && response.data.token) {
        // Store JWT token from backend
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError(response.data.msg || 'Login failed');
      }
    } catch (err) {
      // Show backend error message if available, otherwise show generic error
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
      console.error('Admin login error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-image-page">
      <div className="auth-container">
        <h2>Admin Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="adminPasskey"
              type="password"
              placeholder="Enter admin passkey"
              value={passkey}
              onChange={e => setPasskey(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className={`auth-msg`}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Enter Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;