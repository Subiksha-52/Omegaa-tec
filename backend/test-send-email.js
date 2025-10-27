// Quick test script to send a forgot-password email using the existing emailService
// Usage: node test-send-email.js you@domain.com

const { sendForgotPasswordEmail } = require('./services/emailService');

async function run() {
  const to = process.argv[2] || process.env.TEST_EMAIL;
  const token = 'local-test-token-123456';
  if (!to) {
    console.error('Usage: node test-send-email.js recipient@example.com');
    process.exit(1);
  }

  try {
    console.log('Sending test forgot-password email to', to);
    const res = await sendForgotPasswordEmail(to, token);
    console.log('sendForgotPasswordEmail result:', res);
  } catch (err) {
    console.error('sendForgotPasswordEmail threw error:', err);
  }
}

run();
