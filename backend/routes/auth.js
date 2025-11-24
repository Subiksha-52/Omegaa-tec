const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
// email sending moved to services/emailService (Brevo)
const crypto = require('crypto'); // For generating OTP
const { sendEmail, sendForgotPasswordEmail } = require('../services/emailService');

// Rate limiting for login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    msg: 'Too many login attempts, please try again later.',
  },
});

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send OTP email using email service (Brevo)
const sendOTPEmail = async (email, otp) => {
  try {
    const res = await sendEmail(email, 'otp', { otp });
    return res.success;
  } catch (err) {
    console.error('sendOTPEmail error:', err);
    return false;
  }
};

// Register - Step 1: Send OTP
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate password strength
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      // Update existing unverified user
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = hashedPassword;
      user.phone = phone;
      user.emailVerificationCode = otp;
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
    } else {
      // Create new user
      user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        emailVerificationCode: otp,
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      });
      await user.save();
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ success: true, msg: 'Verification code sent to your email' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, emailCode } = req.body;
    const user = await User.findOne({
      email,
      emailVerificationCode: emailCode,
      verificationCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ success: true, msg: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.emailVerificationCode = otp;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ success: true, msg: 'Verification code resent' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check if account is locked
    if (user.isLocked && user.lockUntil > Date.now()) {
      return res.status(423).json({ msg: 'Account is locked due to too many failed login attempts. Please try again later or contact support.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
        await user.save();
        return res.status(423).json({ msg: 'Account locked due to too many failed login attempts. Please try again in 2 hours.' });
      }
      await user.save();
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Successful login: reset attempts and unlock
    user.loginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint (for client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    console.log(`🔐 User ${req.user.id} logged out successfully`);
    res.json({
      success: true,
      msg: 'Logged out successfully. Please remove the token from client storage.'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    const emailSent = await sendForgotPasswordEmail(user.email, resetToken);
    // Log result for debugging (do not leak secrets). Include raw Brevo response only in non-production.
    console.log('Forgot password email result:', {
      to: user.email,
      success: !!emailSent.success,
      messageId: emailSent.messageId || null,
      raw: process.env.NODE_ENV !== 'production' ? emailSent.raw : undefined
    });

    if (!emailSent.success) {
      console.error('Forgot password email error (detailed):', emailSent.error || emailSent.raw || emailSent);
      // In development return the raw error to help debugging; in production keep generic
      const isDev = process.env.NODE_ENV !== 'production';
      return res.status(500).json({ error: 'Failed to send reset email', details: isDev ? (emailSent.error || emailSent.raw || emailSent) : undefined });
    }

    res.json({ success: true, msg: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate password strength
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (newPassword.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ success: true, msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login with passkey
router.post('/admin-login', async (req, res) => {
  try {
    const { passkey } = req.body;
    const adminPasskey = process.env.ADMIN_PASSKEY || 'admin123'; // Default passkey, should be set in .env

    if (passkey !== adminPasskey) {
      return res.status(401).json({ msg: 'Invalid admin passkey' });
    }

    // Create a JWT token for admin with admin role
    const adminToken = jwt.sign(
      { id: 'admin', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: adminToken,
      role: 'admin',
      msg: 'Admin login successful'
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile (alias for /me)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Login - Secure passkey validation
router.post('/admin-login', async (req, res) => {
  try {
    const { passkey } = req.body;

    if (!passkey) {
      return res.status(400).json({ msg: 'Admin passkey required' });
    }

    // Get admin passkey from environment variable (must be set on server)
    const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY;
    
    console.log('🔐 Admin login attempt - ADMIN_PASSKEY set:', !!ADMIN_PASSKEY);
    
    if (!ADMIN_PASSKEY) {
      console.error('❌ ADMIN_PASSKEY not set in environment variables');
      return res.status(500).json({ msg: 'Admin authentication not configured on server' });
    }

    console.log('📝 Passkey length:', passkey.length, 'Expected length:', ADMIN_PASSKEY.length);
    console.log('📝 Passkey match:', passkey === ADMIN_PASSKEY);

    // Validate passkey (trim to remove accidental whitespace)
    if (passkey.trim() !== ADMIN_PASSKEY.trim()) {
      console.warn('❌ Invalid admin passkey attempt - mismatch');
      return res.status(401).json({ msg: 'Invalid passkey' });
    }

    // Generate JWT token for admin session (valid for 24 hours)
    const token = jwt.sign(
      { admin: true, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Admin login successful - token generated');
    res.json({ success: true, msg: 'Admin authenticated', token });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
