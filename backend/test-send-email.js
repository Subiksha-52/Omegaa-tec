require('dotenv').config();
const { sendForgotPasswordEmail } = require('./services/emailService');

async function run() {
  const to = process.argv[2] || process.env.TEST_EMAIL;
  const token = 'local-test-token-123456';
  
  if (!to) {
    console.error('Usage: node test-send-email.js recipient@example.com');
    process.exit(1);
  }

  // Check required environment variables
  console.log('\nChecking environment variables:');
  const requiredVars = ['BREVO_API_KEY', 'EMAIL_FROM', 'EMAIL_FROM_NAME', 'FRONTEND_URL'];
  let missingVars = false;
  
  for (const varName of requiredVars) {
    const isSet = process.env[varName] && process.env[varName].length > 0;
    console.log(`- ${varName}: ${isSet ? '✓ Set' : '✗ Missing'}`);
    if (!isSet) missingVars = true;
  }

  if (missingVars) {
    console.error('\nError: Some required environment variables are missing. Please check your .env file.');
    process.exit(1);
  }

  try {
    console.log(`\nSending test forgot-password email to ${to}...`);
    const res = await sendForgotPasswordEmail(to, token);
    
    if (res.success) {
      console.log('\n✓ Email sent successfully!');
      console.log('Message ID:', res.messageId || 'Not provided');
    } else {
      console.error('\n✗ Failed to send email:', res.error || 'Unknown error');
      if (res.raw) {
        console.error('Raw error:', JSON.stringify(res.raw, null, 2));
      }
      process.exit(1);
    }
  } catch (err) {
    console.error('\n✗ Error sending email:', err.message || err);
    if (err.response) {
      console.error('API Response:', JSON.stringify(err.response, null, 2));
    }
    process.exit(1);
  }
}

run();
