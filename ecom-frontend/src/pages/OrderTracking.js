import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderTracking.css';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [showOrderList, setShowOrderList] = useState(false);
  const navigate = useNavigate();

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    // Fetch user's orders for quick selection
    fetchUserOrders();

    // Check if orderId is in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      // Auto-track the order if ID is provided in URL
      handleTrackOrderFromUrl(orderIdFromUrl);
    }
  }, []);

  const handleTrackOrderFromUrl = async (orderId) => {
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      if (!isLoggedIn || !token) {
        navigate('/login');
        return;
      }

      const response = await api.get(`/api/orders/${orderId}/tracking`);
      // axios returns the data on success
      setOrder(response.data);
    } catch (err) {
      // axios throws for non-2xx responses — inspect err.response when available
      if (err?.response) {
        if (err.response.status === 404) {
          setError('Order not found. Please check your order ID.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to view this order.');
        } else {
          setError('Failed to fetch order details. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      if (!isLoggedIn || !token) {
        navigate('/login');
        return;
      }
      const response = await api.get('/api/orders/user');
      setUserOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      if (!isLoggedIn || !token) {
        navigate('/login');
        return;
      }
      const response = await api.get(`/api/orders/${orderId}/tracking`);
      setOrder(response.data);
    } catch (err) {
      if (err?.response) {
        if (err.response.status === 404) {
          setError('Order not found. Please check your order ID.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to view this order.');
        } else {
          setError('Failed to fetch order details. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (selectedOrderId) => {
    setOrderId(selectedOrderId);
    setShowOrderList(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      processing: '#2196f3',
      shipped: '#4caf50',
      delivered: '#8bc34a',
      cancelled: '#f44336',
      returned: '#9c27b0'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
      returned: '↩️'
    };
    return icons[status] || '📦';
  };

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-header">
        <h1>Track Your Order</h1>
        <p>Enter your order ID or select from your recent orders to track the status</p>
      </div>

      <div className="order-tracking-form">
        <form onSubmit={handleTrackOrder}>
          <div className="form-group">
            <label htmlFor="orderId">Order ID</label>
            <div className="input-group">
              <input
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., TRK1234567890)"
                required
              />
              {userOrders.length > 0 && (
                <button
                  type="button"
                  className="select-order-btn"
                  onClick={() => setShowOrderList(!showOrderList)}
                >
                  {showOrderList ? 'Hide' : 'Select'}
                </button>
              )}
            </div>
          </div>

          {showOrderList && userOrders.length > 0 && (
            <div className="order-list">
              <h3>Your Recent Orders</h3>
              {userOrders.slice(0, 5).map((userOrder) => (
                <div
                  key={userOrder._id}
                  className="order-item"
                  onClick={() => handleOrderSelect(userOrder._id)}
                >
                  <div className="order-info">
                    <span className="order-id">Order #{userOrder._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">
                      {new Date(userOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`order-status status-${userOrder.status}`}>
                    {userOrder.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="track-btn" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      {order && (
        <div className="order-details">
          <div className="order-header">
            <h2>Order #{order.orderId.slice(-8).toUpperCase()}</h2>
            <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
              {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-card">
              <h3>Tracking Information</h3>
              <div className="tracking-details">
                <p><strong>Tracking Number:</strong> {order.shipping?.trackingNumber || 'Not available'}</p>
                <p><strong>Carrier:</strong> {order.shipping?.carrier || 'Standard Shipping'}</p>
                <p><strong>Estimated Delivery:</strong> {order.shipping?.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>

            <div className="info-card">
              <h3>Order Timeline</h3>
              <div className="timeline">
                {order.statusHistory?.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker" style={{ backgroundColor: getStatusColor(item.status) }}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="timeline-content">
                      <h4>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</h4>
                      <p>{new Date(item.timestamp).toLocaleString()}</p>
                      {item.note && <p className="timeline-note">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-items">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item-card">
                  <div className="item-image">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} />
                    ) : (
                      <div className="placeholder-image">📦</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.product?.name || 'Product'}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-actions">
            <button
              className="action-btn secondary"
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </button>
            <button
              className="action-btn primary"
              onClick={() => window.location.reload()}
            >
              Track Another Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
