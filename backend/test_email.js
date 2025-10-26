require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Environment Variables Check ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail (default)');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Only proceed if we have the required credentials
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER or EMAIL_PASS not found in environment variables');
  console.log('Please check your .env file in the backend directory');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself for testing
  subject: 'Test Email from E-commerce App',
  html: '<h1>Test Email</h1><p>If you receive this, email sending is working!</p>'
};

console.log('=== Attempting to send test email ===');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Email sending failed:', error.message);
  } else {
    console.log('✅ Email sent successfully:', info.response);
  }
});
