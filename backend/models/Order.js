// backend/models/Order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: String
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], default: [] },

  // Address can be embedded or referenced depending on your app
  address: {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },

  shipping: {
    method: { type: String, default: 'standard' },
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippingCost: { type: Number, default: 0 }
  },

  // pricing & payment
  itemsTotal: { type: Number, default: 0 },
  shippingTotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'cod' }, // e.g., 'cod', 'razorpay', 'stripe'
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },

  // Razorpay payment details
  razorpay_payment_id: String,
  razorpay_order_id: String,
  razorpay_signature: String,

  // order status lifecycle
  status: {
    type: String,
    enum: [
      'pending',         // just created, awaiting processing/payment
      'processed',       // confirmed by merchant
      'packed',          // packaged
      'shipped',         // handed to courier
      'out_for_delivery',// with local courier
      'delivered',       // delivered to customer
      'cancelled',       // cancelled before shipping
      'returned',        // returned by customer
      'refunded'         // refund issued
    ],
    default: 'pending'
  },

  statusHistory: { type: [StatusHistorySchema], default: [] },

  cancellation: {
    isCancelled: { type: Boolean, default: false },
    reason: String,
    requestedAt: Date,
    refundedAmount: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ['pending','completed','rejected'], default: 'pending' }
  },

  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: String,
    requestedAt: Date,
    status: { type: String, enum: ['pending','approved','rejected','completed'], default: 'pending' }
  },

}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

/**
 * Pre-save hook: when status changes, push a record into statusHistory.
 * This allows routes to rely on statusHistory being up-to-date.
 */
OrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const note = `Order status changed to ${this.status}`;
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note
    });
  }
  next();
});

/**
 * Instance helper to compute totals if you want to recalc
 * (Optional) Call before save if you compute totals server-side.
 */
OrderSchema.methods.recalculateTotals = function () {
  const itemsTotal = (this.items || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  this.itemsTotal = itemsTotal;
  this.grandTotal = itemsTotal + (this.shippingTotal || 0) + (this.tax || 0) - (this.discount || 0);
  return this;
};

module.exports = mongoose.model('Order', OrderSchema);
