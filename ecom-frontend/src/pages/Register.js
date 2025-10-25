import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import './ProductList.css';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(1);
  const [codes, setCodes] = useState({ emailCode: '', phoneCode: '' });
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, msg: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'password') {
      validatePasswordStrength(value);
    }
  };
  const handleCodeChange = e => setCodes({ ...codes, [e.target.name]: e.target.value });

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setPasswordStrength({ valid: false, msg: 'Password must be at least 8 characters long.' });
      return;
    }
    if (!hasUpperCase) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one uppercase letter.' });
      return;
    }
    if (!hasLowerCase) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one lowercase letter.' });
      return;
    }
    if (!hasNumbers) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one number.' });
      return;
    }
    if (!hasSpecialChar) {
      setPasswordStrength({ valid: false, msg: 'Password must contain at least one special character.' });
      return;
    }
    setPasswordStrength({ valid: true, msg: 'Password is strong!' });
  };

  const getPasswordStrengthColor = () => {
    if (!form.password) return '#ccc';
    if (passwordStrength.valid) return '#4caf50';
    return '#f44336';
  };

  const getPasswordStrengthWidth = () => {
    if (!form.password) return '0%';
    const checks = [
      form.password.length >= 8,
      /[A-Z]/.test(form.password),
      /[a-z]/.test(form.password),
      /\d/.test(form.password),
      /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
    ];
    const passed = checks.filter(Boolean).length;
    return `${(passed / 5) * 100}%`;
  };

  const startOtpTimer = () => {
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (form.password !== form.confirmPassword) {
      setMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!passwordStrength.valid) {
      setMsg(passwordStrength.msg);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        setEmail(form.email);
        setStep(2);
        setMsg('Verification code sent to your email!');
        alert('Verification code sent to your email!');
        startOtpTimer();
      } else {
        setMsg(data.msg);
      }
    } catch (error) {
      setMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const resendOtp = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMsg('Verification code resent!');
        setOtpTimer(60);
        startOtpTimer();
      } else {
        setMsg(data.msg);
      }
    } catch (error) {
      setMsg('Network error. Please try again.');
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...codes })
      });
      const data = await res.json();

      setMsg(data.msg);
      if (res.ok) {
        setStep(3);
        alert('Email verified successfully!');
        setTimeout(() => {
          navigate('/login', { state: { verified: true } });
        }, 2000);
      }
    } catch (error) {
      setMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-image-page">
      <div className="auth-container">
        <h2>Create Account</h2>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {form.password && (
                <div style={{ marginTop: '5px' }}>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#eee',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: getPasswordStrengthWidth(),
                      height: '100%',
                      backgroundColor: getPasswordStrengthColor(),
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <small style={{
                    color: passwordStrength.valid ? '#4caf50' : '#f44336',
                    fontSize: '12px',
                    marginTop: '2px',
                    display: 'block'
                  }}>
                    {passwordStrength.msg}
                  </small>
                </div>
              )}
            </div>

            <div className="form-group">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>


          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerify}>
            <div className="form-group">
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                Enter the 6-digit verification code sent to {email}
              </p>

              <div className="otp-container">
                <input
                  className="otp-input"
                  name="emailCode"
                  placeholder="000000"
                  value={codes.emailCode}
                  onChange={handleCodeChange}
                  maxLength="6"
                  required
                  disabled={loading}
                />
              </div>

              <div className="otp-timer">
                {otpTimer > 0 ? (
                  `Resend code in ${otpTimer}s`
                ) : (
                  <span className="otp-resend" onClick={resendOtp}>
                    Resend Verification Code
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || codes.emailCode.length !== 6}
              className={loading ? 'loading' : ''}
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="success-animation" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
            <h3 style={{ color: '#388e3c', marginBottom: '10px' }}>Registration Complete!</h3>
            <p style={{ color: '#666' }}>Your account has been successfully verified.</p>
            <p style={{ color: '#666' }}>Redirecting to login page...</p>
          </div>
        )}

        {msg && (
          <div className={`auth-msg ${msg.includes('success') || msg.includes('sent') ? 'success' : ''}`}>
            {msg}
          </div>
        )}

        {step === 1 && (
          <div className="auth-link">
            Already have an account?{' '}
            <a href="/login" style={{ fontWeight: '600' }} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Sign In
            </a>
          </div>
        )}


      </div>
    </div>
  );
};

export default Register;
