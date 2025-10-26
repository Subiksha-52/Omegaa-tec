const https = require('https');

// Email templates
const emailTemplates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmation - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
        <p>Dear Customer,</p>
        <p>Thank you for your order! Your order has been successfully placed.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Tracking Number:</strong> ${order.shipping?.trackingNumber || 'Pending'}</p>
          <p><strong>Estimated Delivery:</strong> ${order.shipping?.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : 'TBD'}</p>
          <p><strong>Total Amount:</strong> $${order.total?.toFixed(2) || '0.00'}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Items Ordered:</h3>
          <ul>
            ${order.items?.map(item => `
              <li>${item.product?.name || 'Product'} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('') || ''}
          </ul>
        </div>

        <p>You can track your order status at any time using the tracking number above.</p>
        <p>If you have any questions, please contact our customer support.</p>

        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  orderStatusUpdate: (order, newStatus) => ({
    subject: `Order Status Update - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Order Status Update</h2>
        <p>Dear Customer,</p>
        <p>Your order status has been updated.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>New Status:</strong> <span style="color: #007bff; font-weight: bold;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
          <p><strong>Tracking Number:</strong> ${order.shipping?.trackingNumber || 'Pending'}</p>
          <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
        </div>

        ${newStatus === 'shipped' ? `
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h4 style="color: #155724; margin-top: 0;">🎉 Your order has been shipped!</h4>
            <p style="color: #155724; margin-bottom: 0;">Estimated delivery: ${order.shipping?.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : 'TBD'}</p>
          </div>
        ` : ''}

        ${newStatus === 'delivered' ? `
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h4 style="color: #155724; margin-top: 0;">✅ Your order has been delivered!</h4>
            <p style="color: #155724; margin-bottom: 0;">Thank you for shopping with us. We hope you enjoy your purchase!</p>
          </div>
        ` : ''}

        <p>You can track your order status at any time using your order tracking page.</p>
        <p>If you have any questions, please contact our customer support.</p>

        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  orderCancellation: (order) => ({
    subject: `Order Cancellation Confirmation - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Order Cancellation Confirmation</h2>
        <p>Dear Customer,</p>
        <p>Your order has been successfully cancelled.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Cancellation Reason:</strong> ${order.cancellation?.reason || 'Customer requested'}</p>
          <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Refund Status:</strong> ${order.cancellation?.refundStatus || 'Pending'}</p>
        </div>

        <p>If you have any questions about your refund or cancellation, please contact our customer support.</p>

        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  returnRequest: (order) => ({
    subject: `Return Request Received - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Return Request Received</h2>
        <p>Dear Customer,</p>
        <p>We have received your return request and are processing it.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Return Details:</h3>
          <p><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Return Reason:</strong> ${order.return?.reason || 'Customer requested'}</p>
          <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Return Tracking:</strong> ${order.return?.returnTrackingNumber || 'To be provided'}</p>
        </div>

        <p>Our team will review your return request and get back to you within 2-3 business days.</p>
        <p>If you have any questions, please contact our customer support.</p>

        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  refundProcessed: (order) => ({
    subject: `Refund Processed - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Refund Processed</h2>
        <p>Dear Customer,</p>
        <p>Your refund has been successfully processed.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Refund Details:</h3>
          <p><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Refund Amount:</strong> $${order.cancellation?.refundedAmount || order.total || '0.00'}</p>
          <p><strong>Processed At:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p>The refund will be credited to your original payment method within 3-5 business days.</p>
        <p>If you have any questions, please contact our customer support.</p>

        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  forgotPassword: (resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset</h2>
        <p>Dear User,</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}"
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>

        <p>Best regards,<br>Your E-commerce Team</p>
      </div>
    `
  }),

  // OTP template used for email verification
  otp: (data) => ({
    subject: 'Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p>Dear User,</p>
        <p>Your verification code is:</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${data.otp}
          </span>
        </div>

        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>

        <p>Best regards,<br>${process.env.EMAIL_FROM_NAME || 'Your E-commerce Team'}</p>
      </div>
    `
  })
};

// Internal: send HTTP request to Brevo (no extra deps so works in most Node versions)
const brevoSend = (payload) => {
  return new Promise((resolve, reject) => {
    if (!process.env.BREVO_API_KEY) {
      return reject(new Error('BREVO_API_KEY environment variable is not set'));
    }

    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'api-key': process.env.BREVO_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve(parsed);
          } catch (e) {
            resolve({});
          }
        } else {
          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = { message: data }; }
          const err = new Error(parsed.message || `Brevo API error (status ${res.statusCode})`);
          err.status = res.statusCode;
          err.response = parsed;
          reject(err);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
};

// Send email function with retry logic
const sendEmail = async (to, templateName, data) => {
  const maxRetries = 3;
  let lastError;

  const template = emailTemplates[templateName];
  if (!template) {
    return { success: false, error: `Email template '${templateName}' not found` };
  }

  const emailContent = template(data);

  const payload = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'E-commerce Team',
      email: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    },
    to: [{ email: to }],
    subject: emailContent.subject,
    htmlContent: emailContent.html
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await brevoSend(payload);
      console.log(`📧 Email sent successfully to ${to}: ${emailContent.subject} (attempt ${attempt})`);
      return { success: true, messageId: result?.messageId || result?.messageId || undefined, raw: result };
    } catch (error) {
      console.error(`📧 Email sending failed (attempt ${attempt}/${maxRetries}):`, error.message || error);
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('📧 Email sending failed after all retries:', lastError && (lastError.message || lastError));
  return { success: false, error: lastError && (lastError.message || String(lastError)), raw: lastError };
};

// Specific email functions
const sendOrderConfirmation = async (userEmail, order) => {
  return await sendEmail(userEmail, 'orderConfirmation', order);
};

const sendOrderStatusUpdate = async (userEmail, order, newStatus) => {
  return await sendEmail(userEmail, 'orderStatusUpdate', order, newStatus);
};

const sendOrderCancellation = async (userEmail, order) => {
  return await sendEmail(userEmail, 'orderCancellation', order);
};

const sendReturnRequest = async (userEmail, order) => {
  return await sendEmail(userEmail, 'returnRequest', order);
};

const sendRefundProcessed = async (userEmail, order) => {
  return await sendEmail(userEmail, 'refundProcessed', order);
};

const sendForgotPasswordEmail = async (userEmail, resetToken) => {
  return await sendEmail(userEmail, 'forgotPassword', resetToken);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendOrderCancellation,
  sendReturnRequest,
  sendRefundProcessed,
  sendForgotPasswordEmail
};
