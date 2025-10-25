const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Admin middleware
 * - If the JWT itself contains role:'admin' we allow access without DB lookup (useful for admin passkey tokens)
 * - Otherwise validate that req.user.id is a valid ObjectId and check the user's role in DB
 */
const admin = async (req, res, next) => {
  try {
    console.log('🔐 Admin middleware - req.user:', JSON.stringify(req.user));
    
    // If token explicitly grants admin role, allow through
    if (req.user && req.user.role === 'admin') {
      console.log('✅ Admin middleware: Access granted via admin role in token');
      return next();
    }

    // Validate id before querying DB to avoid CastError
    const userId = req.user && req.user.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.warn('❌ Admin middleware: invalid or missing user id on request', { userId });
      return res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('❌ Admin middleware: User not found', { userId });
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role !== 'admin') {
      console.warn('❌ Admin middleware: User is not admin', { userId, role: user.role });
      return res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }

    console.log('✅ Admin middleware: Access granted via DB user role');
    next();
  } catch (err) {
    console.error('❌ Admin middleware error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = admin;
