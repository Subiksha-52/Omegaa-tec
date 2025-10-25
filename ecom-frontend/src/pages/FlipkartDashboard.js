import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaShoppingBag, FaBox, FaMoneyBillWave, FaChartLine, FaShoppingCart, FaStar, FaHistory, FaTrophy, FaShieldAlt } from "react-icons/fa";
import api from "../api";
import { AuthContext } from '../contexts/AuthContext';
import OrderStatusManager from "../components/OrderStatusManager";
import "./FlipkartDashboard.css";
import { useNotification } from "../contexts/NotificationContext";

const FlipkartDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { showError } = useNotification();

  const { token, user: authUser, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isLoggedIn || !token) {
          setError('Please login to access dashboard');
          setLoading(false);
          return;
        }

        // use profile from AuthContext if available
        const profile = authUser;
        if (profile) {
          setUser(profile);
          try {
            const ordersResponse = await api.get(`/api/orders/user?userId=${profile._id}`);
            setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
          } catch (orderErr) {
            console.warn('No orders found or error fetching orders:', orderErr);
            setOrders([]);
          }
        } else {
          // fallback: fetch profile
          const res = await api.get('/api/auth/profile');
          setUser(res.data);
          const ordersResponse = await api.get(`/api/orders/user?userId=${res.data._id}`);
          setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          showError('Session expired. Please login again.');
          setError('Session expired. Please login again.');
        } else {
          showError('Failed to load dashboard data');
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [showError, token, isLoggedIn, authUser]);

  // Calculate statistics from orders
  const totalOrders = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeOrders = orders.filter(order =>
    order.status && !['delivered', 'cancelled'].includes(order.status.toLowerCase())
  ).length;
  const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

  const handleOrderStatusUpdate = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  if (loading) {
    return (
      <div className="flipkart-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flipkart-dashboard">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <Link to="/login" className="btn btn-primary">
            <FaShieldAlt style={{ marginRight: '0.5rem' }} />
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flipkart-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <FaTrophy style={{ marginRight: '0.5rem', color: '#667eea' }} />
            My Account
          </h1>
          <p>Welcome back, {user?.firstName}! Manage your orders and account settings</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {/* User Profile Card */}
          <div className="user-profile-card">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p>{user?.email}</p>
              {user?.phone && <p>{user.phone}</p>}
              <div className="member-since">
                <FaStar style={{ marginRight: '0.5rem', color: '#ffd700' }} />
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="dashboard-nav">
            <button
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <FaChartLine />
              <span>Overview</span>
            </button>
            <button
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingBag />
              <span>Orders</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaBox />
                  </div>
                  <div className="stat-content">
                    <h3>{totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div className="stat-content">
                    <h3>₹{totalSpend.toLocaleString()}</h3>
                    <p>Total Spend</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-content">
                    <h3>{activeOrders}</h3>
                    <p>Active Orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaStar />
                  </div>
                  <div className="stat-content">
                    <h3>₹{Math.round(averageOrderValue)}</h3>
                    <p>Avg. Order Value</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="orders-section">
                <div className="section-header">
                  <h2>
                    <FaHistory style={{ marginRight: '0.5rem' }} />
                    Recent Orders
                  </h2>
                  {orders.length > 0 && (
                    <Link to="/user-orders" className="view-all">View All</Link>
                  )}
                </div>

                {orders.length > 0 ? (
                  <div className="orders-grid">
                    {orders.slice(0, 4).map((order, index) => (
                      <div key={index} className="order-card">
                        <div className="order-header">
                          <div>
                            <h4 className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</h4>
                            <p className="order-date">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`order-status status-${order.status?.toLowerCase()}`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <div className="order-details">
                          <div className="order-amount">
                            ₹{order.total?.toLocaleString()}
                          </div>
                          <div className="order-actions">
                          <button className="btn btn-outline" onClick={() => navigate('/user-orders')}>View Details</button>
                          <button className="btn btn-primary" onClick={() => navigate(`/track-order?orderId=${order._id}`)}>Track Order</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaHistory size={48} />
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <Link to="/products" className="btn btn-primary">
                      <FaShoppingCart /> Shop Now
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="orders-section">
              <div className="section-header">
                <h2>
                  <FaShoppingBag style={{ marginRight: '0.5rem' }} />
                  Your Orders
                </h2>
              </div>

              {orders.length > 0 ? (
                <div className="orders-grid">
                  {orders.map((order, index) => (
                    <div key={index} className="order-card">
                      <div className="order-header">
                        <div>
                          <h4 className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</h4>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`order-status status-${order.status?.toLowerCase()}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="order-details">
                        <div className="order-amount">
                          ₹{order.total?.toLocaleString()}
                        </div>
                        <div className="order-actions">
                          <button className="btn btn-outline" onClick={() => navigate('/user-orders')}>View Details</button>
                          <button className="btn btn-primary" onClick={() => navigate(`/track-order?orderId=${order._id}`)}>Track Order</button>
                        </div>
                        
                        {/* Order Status Manager for Admin */}
                        {user?.role === 'admin' && (
                          <div className="admin-order-controls">
                            <OrderStatusManager 
                              order={order} 
                              onStatusUpdate={handleOrderStatusUpdate}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaHistory size={48} />
                  <h3>No orders yet</h3>
                  <p>Start shopping to see your orders here</p>
                  <Link to="/products" className="btn btn-primary">
                    <FaShoppingCart /> Shop Now
                  </Link>
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default FlipkartDashboard;
