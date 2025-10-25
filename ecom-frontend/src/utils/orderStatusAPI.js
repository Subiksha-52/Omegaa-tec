// Order Status Management API Utilities
import api from '../api';

/**
 * Update order status (Admin only)
 * @param {string} orderId - The order ID
 * @param {string} status - New status
 * @param {string} note - Optional note
 * @returns {Promise} API response
 */
export const updateOrderStatus = async (orderId, status, note = '') => {
  try {
    const response = await api.put(`/api/orders/${orderId}/status`, {
      status,
      note: note || `Order status changed to ${status}`
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancel order (Customer only)
 * @param {string} orderId - The order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} API response
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    const response = await api.post(`/api/orders/${orderId}/cancel`, {
      reason: reason || 'Customer requested cancellation'
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Get order tracking details
 * @param {string} orderId - The order ID
 * @returns {Promise} API response
 */
export const getOrderTracking = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}/tracking`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    throw error;
  }
};

/**
 * Get all orders for a user
 * @returns {Promise} API response
 */
export const getUserOrders = async () => {
  try {
    const response = await api.get('/api/orders/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get all orders (Admin only)
 * @param {Object} filters - Filter options
 * @returns {Promise} API response
 */
export const getAllOrders = async (filters = {}) => {
  try {
    const response = await api.get('/api/orders', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded'
};

// Status display labels
export const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSED]: 'Processed',
  [ORDER_STATUS.PACKED]: 'Packed',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.RETURNED]: 'Returned',
  [ORDER_STATUS.REFUNDED]: 'Refunded'
};

// Status colors
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#ff9800',
  [ORDER_STATUS.PROCESSED]: '#2196f3',
  [ORDER_STATUS.PACKED]: '#9c27b0',
  [ORDER_STATUS.SHIPPED]: '#4caf50',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: '#ff5722',
  [ORDER_STATUS.DELIVERED]: '#8bc34a',
  [ORDER_STATUS.CANCELLED]: '#f44336',
  [ORDER_STATUS.RETURNED]: '#795548',
  [ORDER_STATUS.REFUNDED]: '#607d8b'
};

// Status icons
export const STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: '⏳',
  [ORDER_STATUS.PROCESSED]: '⚙️',
  [ORDER_STATUS.PACKED]: '📦',
  [ORDER_STATUS.SHIPPED]: '🚚',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: '🚛',
  [ORDER_STATUS.DELIVERED]: '✅',
  [ORDER_STATUS.CANCELLED]: '❌',
  [ORDER_STATUS.RETURNED]: '↩️',
  [ORDER_STATUS.REFUNDED]: '💰'
};
