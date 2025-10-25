// backend/routes/payment.js
const Razorpay = require('razorpay');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: 'rzp_test_7ALd8ndNWkk7vu',
  key_secret: 'qfXln0bCfVRJwDEa7FADi8Tl'
});

// Create payment order - requires authentication
router.post('/create-order', auth, async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100, // in paise
    currency: "INR",
    payment_capture: 1
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment signature - requires authentication
router.post('/verify-signature', auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto.createHmac('sha256', razorpay.key_secret)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    // Payment verified, update order if exists
    try {
      const order = await Order.findOne({ 'payment.razorpay_order_id': razorpay_order_id });
      if (order) {
        order.paymentStatus = 'paid';
        order.payment.razorpay_payment_id = razorpay_payment_id;
        order.payment.razorpay_signature = razorpay_signature;
        await order.save();
      }
      res.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
