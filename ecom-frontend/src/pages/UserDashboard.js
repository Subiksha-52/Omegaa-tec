import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaUser, FaShoppingBag, FaHeart, FaCog, FaBox, FaMoneyBillWave, FaChartLine, FaBell, FaShoppingCart, FaStar, FaHistory } from "react-icons/fa";
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import "./Dashboard.css";
import { useNotification } from "../contexts/NotificationContext";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { showError } = useNotification();

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#FF6B6B"];

  const { token, user: authUser, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isLoggedIn || !token) {
          setError('Please login to access dashboard');
          setLoading(false);
          return;
        }

        if (authUser) {
          setUser(authUser);
          const ordersResponse = await api.get('/api/orders/user');
          setOrders(ordersResponse.data);
        } else {
          const userResponse = await api.get('/api/auth/profile');
          setUser(userResponse.data);
          const ordersResponse = await api.get('/api/orders/user');
          setOrders(ordersResponse.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        showError('Failed to load dashboard data');
        setError('Failed to load dashboard data');
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

  // Calculate order status distribution
  const orderStatusData = [
    { name: "Completed", value: orders.filter(o => o.status?.toLowerCase() === 'delivered').length },
    { name: "Pending", value: orders.filter(o => o.status?.toLowerCase() === 'pending').length },
    { name: "Processing", value: orders.filter(o => o.status?.toLowerCase() === 'processing').length },
    { name: "Cancelled", value: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length },
  ].filter(item => item.value > 0);

  // Calculate monthly spending
  const spendingData = orders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
    const year = new Date(order.createdAt).getFullYear();
    const monthYear = `${month} ${year}`;
    const existing = acc.find(item => item.month === monthYear);
    if (existing) {
      existing.amount += order.total || 0;
    } else {
      acc.push({ month: monthYear, amount: order.total || 0 });
    }
    return acc;
  }, []).slice(-6); // Last 6 months

  // Recent activity (orders + wishlist + reviews)
  const recentActivity = orders.slice(0, 3).map(order => ({
    type: 'order',
    title: `Order #${order._id?.slice(-8).toUpperCase()}`,
    description: `Placed an order for ₹${order.total?.toLocaleString()}`,
    date: new Date(order.createdAt),
    icon: <FaShoppingBag />
  }));

  // Handle view details click - navigate to user orders page
  const handleViewDetails = (order) => {
    navigate('/user-orders');
  };

  // Handle track order click - navigate to order tracking page with order ID
  const handleTrackOrder = (order) => {
    navigate(`/track-order?orderId=${order._id}`);
  };

  if (loading) {
    return (
      <div className="modern-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-dashboard">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p>Here's what's happening with your account today</p>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Sidebar - Navigation */}
        <div className="sidebar">
          <div className="user-profile-card">
            <div className="profile-avatar">
              <FaUser size={32} />
            </div>
            <div className="profile-info">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p className="email">{user?.email}</p>
              {user?.phone && <p className="phone">{user.phone}</p>}
              <div className="member-since">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <nav className="dashboard-nav">
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
            <button 
              className={`nav-item ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              <FaHeart />
              <span>Wishlist</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <FaCog />
              <span>Settings</span>
            </button>
          </nav>

          <div className="quick-stats">
            <h4>Quick Stats</h4>
            <div className="stat-item">
              <FaBox />
              <span>{totalOrders} Orders</span>
            </div>
            <div className="stat-item">
              <FaMoneyBillWave />
              <span>₹{totalSpend.toLocaleString()} Spent</span>
            </div>
            <div className="stat-item">
              <FaStar />
              <span>{activeOrders} Active</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
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
                    <span className="stat-trend">+12% this month</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div className="stat-content">
                    <h3>₹{totalSpend.toLocaleString()}</h3>
                    <p>Total Spend</p>
                    <span className="stat-trend">₹{averageOrderValue.toLocaleString()} avg/order</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-content">
                    <h3>{activeOrders}</h3>
                    <p>Active Orders</p>
                    <span className="stat-trend">In progress</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaHeart />
                  </div>
                  <div className="stat-content">
                    <h3>12</h3>
                    <p>Wishlist Items</p>
                    <span className="stat-trend">3 on sale</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                {/* Order Status Chart */}
                {orderStatusData.length > 0 && (
                  <div className="chart-card">
                    <h3>Order Status</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="chart-legend">
                        {orderStatusData.map((item, index) => (
                          <div key={index} className="legend-item">
                            <span className="color-dot" style={{ backgroundColor: COLORS[index] }}></span>
                            <span>{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Spending Trend */}
                {spendingData.length > 0 && (
                  <div className="chart-card">
                    <h3>Monthly Spending</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={spendingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                          <Bar dataKey="amount" fill="#2874f0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">{activity.icon}</div>
                      <div className="activity-content">
                        <h4>{activity.title}</h4>
                        <p>{activity.description}</p>
                        <span className="activity-time">
                          {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="no-activity">
                      <p>No recent activity</p>
                      <Link to="/products" className="btn btn-primary">
                        <FaShoppingCart /> Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="orders-tab">
              <h2>Your Orders</h2>
              <div className="orders-list">
                {orders.map((order, index) => (
                  <div key={index} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h4>Order #{order._id?.slice(-8).toUpperCase()}</h4>
                        <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-amount">
                        <strong>₹{order.total?.toLocaleString()}</strong>
                      </div>
                      <div className="order-actions">
                        <button className="btn btn-outline" onClick={() => handleViewDetails(order)}>View Details</button>
                        <button className="btn btn-primary" onClick={() => handleTrackOrder(order)}>Track Order</button>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="no-orders">
                    <FaHistory size={48} />
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <Link to="/products" className="btn btn-primary">
                      <FaShoppingCart /> Shop Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="wishlist-tab">
              <h2>Your Wishlist</h2>
              <div className="wishlist-empty">
                <FaHeart size={48} />
                <h3>Your wishlist is empty</h3>
                <p>Save your favorite items here for later</p>
                <Link to="/products" className="btn btn-primary">
                  <FaShoppingCart /> Browse Products
                </Link>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="settings-tab">
              <h2>Account Settings</h2>
              <div className="settings-grid">
                <div className="setting-card">
                  <h4>Personal Information</h4>
                  <p>Update your name, email, and phone number</p>
                  <Link to="/profile-settings" className="btn btn-outline">
                    Edit Profile
                  </Link>
                </div>
                <div className="setting-card">
                  <h4>Security</h4>
                  <p>Change your password and security settings</p>
                  <button className="btn btn-outline">Security Settings</button>
                </div>
                <div className="setting-card">
                  <h4>Notifications</h4>
                  <p>Manage your email and push notifications</p>
                  <button className="btn btn-outline">Notification Settings</button>
                </div>
                <div className="setting-card">
                  <h4>Payment Methods</h4>
                  <p>Add or update your payment information</p>
                  <button className="btn btn-outline">Payment Settings</button>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
