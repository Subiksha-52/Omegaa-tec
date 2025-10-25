import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Auth.css';
import { AuthContext } from '../contexts/AuthContext';
import { FaLock, FaEnvelope, FaKey, FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [locked, setLocked] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const verified = location.state && location.state.verified;
  const { login } = useContext(AuthContext);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setLocked(false);
    setNotVerified(false);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        // use AuthContext to set token (and optionally user data)
        login(data.token, data.user || null);
        setMsg('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMsg(data.msg || 'Login failed');
        if (data.msg && data.msg.includes('locked')) {
          setLocked(true);
        } else if (data.msg && data.msg.includes('verify your email')) {
          setNotVerified(true);
        }
      }
    } catch (error) {
      setMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleResendVerification = () => {
    // Navigate to register or show resend option
    navigate('/register', { state: { resend: true, email: form.email } });
  };

  return (
    <div className="bg-image-page">
      <div className="auth-container">
        <div className="security-badge">🔒 Secure Login</div>
        <h2>
          <FaLock style={{ marginRight: '0.5rem', color: '#667eea' }} />
          Welcome Back
        </h2>

        {verified && (
          <div className="auth-msg success">
            ✅ Your account has been verified! Please login.
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <FaEnvelope className="input-icon" />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <FaKey className="input-icon" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="forgot-password-link">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>


        </form>

        {locked && (
          <div className="auth-msg error">
            <FaLock style={{ marginRight: '0.5rem' }} />
            🔒 Account locked due to too many failed attempts. Please try again later or contact support.
          </div>
        )}

        {notVerified && (
          <div className="auth-msg warning">
            <FaEnvelope style={{ marginRight: '0.5rem' }} />
            📧 Please verify your email before logging in.{' '}
            <button
              onClick={handleResendVerification}
              className="resend-btn"
            >
              Resend verification code
            </button>
          </div>
        )}

        {msg && !locked && !notVerified && (
          <div className={`auth-msg ${msg.includes('success') ? 'success' : 'error'}`}>
            {msg}
          </div>
        )}

        <div className="auth-link">
          Don't have an account?{' '}
          <a href="/register" style={{ fontWeight: '600' }}>
            Create Account
          </a>
        </div>


      </div>
    </div>
  );
};

export default Login;
