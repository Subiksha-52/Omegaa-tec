const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendOrderCancellation,
  sendReturnRequest,
  sendRefundProcessed
} = require('../services/emailService');

// Utility function to generate tracking number
function generateTrackingNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TRK${timestamp}${random}`;
}

// Utility function to calculate estimated delivery
function calculateEstimatedDelivery() {
  const now = new Date();
  // Standard delivery: 3-5 business days
  const deliveryDays = Math.floor(Math.random() * 3) + 3; // 3-5 days
  now.setDate(now.getDate() + deliveryDays);
  return now;
}

// Place order (protected)
router.post('/', auth, async (req, res) => {
  try {
    const Product = require('../models/Product'); // Import here to avoid circular

    // Check stock availability for each item and populate item details
    const populatedItems = [];
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      // Populate item with product details
      populatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || product.images?.[0] || ''
      });
    }

    const orderData = {
      ...req.body,
      items: populatedItems, // Use populated items
      userId: req.user.id, // Add userId from authenticated user
      shipping: {
        ...req.body.shipping,
        trackingNumber: generateTrackingNumber(),
        estimatedDelivery: calculateEstimatedDelivery(),
        carrier: 'Standard Shipping'
      },
      paymentStatus: req.body.paymentMethod === 'cod' ? 'pending' : 'paid' // Set payment status based on method
    };
    const order = new Order(orderData);
    // Calculate grandTotal before saving
    order.recalculateTotals();
    await order.save();

    // Deduct stock after order is saved
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    // Populate product details for response
    await order.populate('items.product');

    // Send order confirmation email
    try {
      const user = await User.findById(req.user.id);
      if (user && user.email) {
        await sendOrderConfirmation(user.email, order);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (protected - admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get orders for a specific user (protected)
router.get('/user', auth, async (req, res) => {
  try {
    const { userId } = req.query;

    // If userId is provided, verify it's the authenticated user
    if (userId && userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Use authenticated user's ID if no userId provided
    const targetUserId = userId || req.user.id;

    const orders = await Order.find({ userId: targetUserId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get order tracking details by order ID (protected)
router.get('/:orderId/tracking', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Debug logging to help trace 403 errors
    try {
      console.log(`Order tracking requested: order.userId=${order.userId?.toString()} req.user.id=${req.user?.id} req.user.role=${req.user?.role}`);
    } catch (dbgErr) {
      console.warn('Order tracking debug log failed', dbgErr);
    }

    // Allow admin users to view any order; regular users can view only their own orders
    if (req.user?.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const trackingInfo = {
      orderId: order._id,
      status: order.status,
      statusHistory: order.statusHistory,
      shipping: order.shipping,
      items: order.items,
      createdAt: order.createdAt,
      estimatedDelivery: order.shipping.estimatedDelivery
    };

    res.json(trackingInfo);
  } catch (err) {
    console.error('Get tracking error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update order status (admin only)
router.put('/:orderId/status', auth, admin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status - the pre-save middleware will handle statusHistory
    order.status = status;
    if (note) {
      order.notes.push({
        content: note,
        createdBy: req.user.id,
        isInternal: true
      });
    }

    await order.save();
    await order.populate('items.product');

    // Send status update email to customer
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        await sendOrderStatusUpdate(user.email, order, status);
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cancel order (protected)
router.post('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        error: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order cancellation details
    order.status = 'cancelled';
    order.cancellation = {
      isCancelled: true,
      reason: reason || 'Customer requested cancellation',
      requestedAt: new Date(),
      refundStatus: 'pending'
    };

    await order.save();

    // Send cancellation confirmation email
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        await sendOrderCancellation(user.email, order);
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Request return (protected)
router.post('/:orderId/return', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, returnTrackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if order can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({
        error: 'Only delivered orders can be returned'
      });
    }

    // Update order return details
    order.return = {
      isReturned: true,
      reason: reason || 'Customer requested return',
      requestedAt: new Date(),
      refundStatus: 'pending',
      returnTrackingNumber
    };

    await order.save();

    res.json({
      message: 'Return request submitted successfully',
      order
    });
  } catch (err) {
    console.error('Return request error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Process refund (admin only)
router.put('/:orderId/refund', auth, admin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundedAmount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order has pending refund
    if (order.cancellation?.refundStatus !== 'pending' && order.return?.refundStatus !== 'pending') {
      return res.status(400).json({ error: 'No pending refund for this order' });
    }

    // Update refund status
    if (order.cancellation) {
      order.cancellation.refundStatus = 'completed';
      order.cancellation.refundedAmount = refundedAmount || order.grandTotal;
      order.cancellation.refundedAt = new Date();
    } else if (order.return) {
      order.return.refundStatus = 'completed';
      order.return.refundedAmount = refundedAmount || order.grandTotal;
      order.return.refundedAt = new Date();
    }

    await order.save();

    // Send refund processed email
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        await sendRefundProcessed(user.email, order);
      }
    } catch (emailError) {
      console.error('Failed to send refund email:', emailError);
      // Don't fail the refund if email fails
    }

    res.json({
      message: 'Refund processed successfully',
      order
    });
  } catch (err) {
    console.error('Process refund error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get order history/timeline (protected)
router.get('/:orderId/history', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = [
      {
        status: 'Order Placed',
        timestamp: order.createdAt,
        description: 'Your order has been successfully placed'
      },
      ...order.statusHistory.map(item => ({
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        timestamp: item.timestamp,
        description: item.note || `Order status changed to ${item.status}`
      }))
    ];

    res.json({
      orderId: order._id,
      history: history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (err) {
    console.error('Get order history error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add this before module.exports

// Get order sales statistics (protected)
router.get('/stats', auth, async (req, res) => {
  try {
    // Aggregate total revenue and total orders
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    // Aggregate monthly revenue for the last 12 months
    const now = new Date();
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    const monthlyRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          monthlyRevenue: { $sum: "$grandTotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalOrders,
      totalRevenue,
      monthlyRevenue: monthlyRevenueAgg,
      averageOrderValue: avgOrderValue
    });
  } catch (err) {
    console.error('Get order stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
