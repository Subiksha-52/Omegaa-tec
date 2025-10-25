import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import "./Dashboard.css";
import "./UserOrderPage.css";

const UserOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { token, user: authUser, isLoggedIn } = useContext(AuthContext);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await api.post(`/api/orders/${orderId}/cancel`, {
        reason: 'Customer requested cancellation'
      });

      // Update the order status in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: 'cancelled', cancellation: response.data.order.cancellation }
            : order
        )
      );

      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. Please try again.');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!isLoggedIn || !token) {
          setError('Please login to view orders');
          setLoading(false);
          return;
        }

        let userId = authUser?._id;
        if (!userId) {
          // try to fetch profile
          const profile = await api.get('/api/auth/profile');
          userId = profile.data._id;
        }

        if (!userId) {
          setError('User ID not found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await api.get(`/api/orders/user?userId=${userId}`);
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, isLoggedIn, authUser]);

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status?.toLowerCase() === filterStatus.toLowerCase());

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="user-order-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-order-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-order-page">
      <div className="page-header">
        <h1>My Orders</h1>
        <div className="filter-controls">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>{filterStatus === "all" 
            ? "You haven't placed any orders yet." 
            : `No orders with status "${filterStatus}" found.`}
          </p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id?.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="order-details">
                <div className="order-items">
                  <h4>Items:</h4>
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">
                        {item.product?.name || `Product ${index + 1}`}
                      </span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      <span className="item-price">
                        ₹{item.product?.price ? (item.product.price * item.quantity).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{order.total?.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="summary-row discount">
                      <span>Discount:</span>
                      <span>-₹{order.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{(order.total - (order.discount || 0)).toLocaleString()}</span>
                  </div>
                </div>

                {order.shipping && (
                  <div className="shipping-info">
                    <h4>Shipping:</h4>
                    <p><strong>Method:</strong> {order.shipping.method || 'N/A'}</p>
                    <p><strong>Carrier:</strong> {order.shipping.carrier || 'N/A'}</p>
                    <p><strong>Tracking Number:</strong> {order.shipping.trackingNumber || 'N/A'}</p>
                    <p><strong>Estimated Delivery:</strong> {order.shipping.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Shipping Cost:</strong> ₹{Number(order.shipping.shippingCost || 0).toLocaleString()}</p>
                  </div>
                )}

                {order.address && (
                  <div className="address-info">
                    <h4>Delivery Address:</h4>
                    <p>
                      {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipCode}
                    </p>
                  </div>
                )}
              </div>

              <div className="order-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => window.location.href = `/track-order?orderId=${order._id}`}
                >
                  View Details
                </button>
                {order.status?.toLowerCase() === 'delivered' && (
                  <button className="btn btn-primary">Write Review</button>
                )}
                {order.status?.toLowerCase() === 'pending' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrderPage;
