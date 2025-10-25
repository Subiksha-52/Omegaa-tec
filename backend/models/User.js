const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: String,
  phoneVerificationCode: String,
  verificationCodeExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockUntil: Date,
  activationToken: String,
  activationTokenExpires: Date,
  resetToken: String,
  resetTokenExpires: Date
});

module.exports = mongoose.model('User', userSchema);
