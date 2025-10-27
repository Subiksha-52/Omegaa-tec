import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import './ForgotPassword.css';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
  // Use the app-wide API instance so requests go to the configured backend (not the frontend host)
  const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="security-badge">🔒 Password Recovery</div>
        <h2>
          <FaLock style={{ marginRight: '0.5rem', color: '#667eea' }} />
          Forgot Password
        </h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="back-to-login">
          <Link to="/login">
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
