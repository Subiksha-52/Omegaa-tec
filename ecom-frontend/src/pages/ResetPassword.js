import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';
import { FaLock, FaKey, FaShieldAlt } from 'react-icons/fa';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, msg: '', level: '' });

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setPasswordStrength({ valid: false, msg: 'Password must be at least 8 characters long.', level: 'weak' });
      return;
    }
    if (!hasUpperCase) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one uppercase letter.', level: 'weak' });
      return;
    }
    if (!hasLowerCase) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one lowercase letter.', level: 'weak' });
      return;
    }
    if (!hasNumbers) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one number.', level: 'medium' });
      return;
    }
    if (!hasSpecialChar) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one special character.', level: 'medium' });
      return;
    }
    setPasswordStrength({ valid: true, msg: 'Password is strong!', level: 'strong' });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePasswordStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!passwordStrength.valid) {
      setError(passwordStrength.msg);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`https://omegaa-tec-1.onrender.com/api/auth/reset-password`, {
        token,
        newPassword
      });
      setMessage(response.data.msg);
      alert('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <div className="security-badge">🔒 Secure Reset</div>
        <h2>
          <FaShieldAlt style={{ marginRight: '0.5rem', color: '#667eea' }} />
          Reset Password
        </h2>
        <p>Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <FaKey className="input-icon" />
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter new password"
            />
            {newPassword && (
              <div className={`password-strength ${passwordStrength.level}`}>
                <div className="password-strength-fill"></div>
                <div className={`password-strength-text ${passwordStrength.level}`}>
                  {passwordStrength.msg}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <FaLock className="input-icon" />
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default ResetPassword;
