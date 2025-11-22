import React, { useEffect, useState, useContext } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaStar, FaTruck, FaShieldAlt, FaHeadphones, FaArrowRight, FaSearch, FaBox, FaClock, FaMapMarkerAlt, FaUserShield } from "react-icons/fa";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";
import api from "../api";
import "./Home.css";


// Order Tracking Component
const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/orders/track/${trackingId}`);
      setOrderStatus(response.data);
    } catch (error) {
      console.error('Error tracking order:', error);
      setOrderStatus({ error: 'Order not found' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-tracking-widget">
      <h3>Track Your Order</h3>
      <form onSubmit={handleTrackOrder} className="tracking-form">
        <div className="tracking-input-group">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="tracking-input"
          />
          <button type="submit" className="track-btn" disabled={loading}>
            {loading ? <FaClock className="spinning" /> : <FaSearch />}
            Track
          </button>
        </div>
      </form>
      
      {orderStatus && (
        <div className="tracking-result">
          {orderStatus.error ? (
            <div className="tracking-error">
              <p>Order not found. Please check your Order ID.</p>
            </div>
          ) : (
            <div className="tracking-success">
              <div className="order-info">
                <h4>Order #{orderStatus._id?.slice(-8).toUpperCase()}</h4>
                <p className="order-date">
                  <FaClock /> {new Date(orderStatus.createdAt).toLocaleDateString()}
                </p>
                <p className="order-amount">₹{orderStatus.total?.toLocaleString()}</p>
              </div>
              <div className="status-info">
                <span className={`status-badge status-${orderStatus.status?.toLowerCase()}`}>
                  {orderStatus.status || 'Processing'}
                </span>
                <p className="status-description">
                  {orderStatus.status === 'delivered' 
                    ? 'Your order has been delivered successfully!'
                    : orderStatus.status === 'shipped'
                    ? 'Your order is on its way!'
                    : 'Your order is being processed...'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/api/products?featured=true&limit=8');
        // Ensure we have an array, even if the API returns unexpected data
        const products = Array.isArray(response.data) ? response.data : [];
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Set empty array on error to prevent map errors
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (isLoggedIn) {
      addToCart(product, 1);
    } else {
      // Redirect to login if not logged in
      window.location.href = '/login';
    }
  };

  return (
    <div className="flipkart-home">
      <Helmet>
        <title>SecureTech - Premium Security Solutions | Shop Now</title>
        <meta
          name="description"
          content="Discover top-quality CCTV and security solutions for homes and businesses. Fast delivery, expert support, and trusted brands."
        />
        <meta name="keywords" content="CCTV, security cameras, home security, business security, surveillance systems" />
      </Helmet>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Premium Security Solutions</h1>
            <p>Protect what matters most with our trusted security products</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn-primary">
                <FaShoppingCart />
                Shop Now
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/api/placeholder/600/400" alt="Security Solutions" />
          </div>
        </div>
      </section>

      {/* Order Tracking Widget */}
      <section className="tracking-section">
        <div className="container">
          <div className="tracking-container">
            <div className="tracking-content">
              <h2>Track Your Order</h2>
              <p>Enter your Order ID to check the status of your security products</p>
              <OrderTracking />
            </div>
            <div className="tracking-features">
              <div className="tracking-feature">
                <FaMapMarkerAlt />
                <h3>Real-time Location</h3>
                <p>Track your package location in real-time</p>
              </div>
              <div className="tracking-feature">
                <FaClock />
                <h3>Delivery Updates</h3>
                <p>Get instant notifications about delivery status</p>
              </div>
              <div className="tracking-feature">
                <FaBox />
                <h3>Secure Delivery</h3>
                <p>Your security products delivered safely</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose SecureTech?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaShieldAlt />
              <h3>Premium Quality</h3>
              <p>Industry-leading security products with warranties</p>
            </div>
            <div className="feature-card">
              <FaTruck />
              <h3>Fast Delivery</h3>
              <p>Quick nationwide shipping with real-time tracking</p>
            </div>
            <div className="feature-card">
              <FaHeadphones />
              <h3>24/7 Support</h3>
              <p>Expert technical support whenever you need it</p>
            </div>
            <div className="feature-card">
              <FaStar />
              <h3>Trusted Brand</h3>
              <p>Thousands of satisfied customers nationwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">
              View All <FaArrowRight />
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="product-card loading">
                  <div className="product-image"></div>
                  <div className="product-info">
                    <div className="product-name"></div>
                    <div className="product-price"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      <div className="product-badge">Featured</div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-rating">
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <span>(4.5)</span>
                      </div>
                      <div className="product-price">
                        <span className="current-price">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="original-price">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaShoppingCart />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>No featured products available at the moment.</p>
                  <Link to="/products" className="btn-primary">
                    Browse All Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/products?category=cctv" className="category-card">
              <div className="category-icon">📹</div>
              <h3>CCTV Cameras</h3>
              <p>HD surveillance solutions</p>
            </Link>
            <Link to="/products?category=alarm" className="category-card">
              <div className="category-icon">🚨</div>
              <h3>Alarm Systems</h3>
              <p>Intrusion detection</p>
            </Link>
            <Link to="/products?category=access" className="category-card">
              <div className="category-icon">🔐</div>
              <h3>Access Control</h3>
              <p>Smart door locks</p>
            </Link>
            <Link to="/products?category=detector" className="category-card">
              <div className="category-icon">🔥</div>
              <h3>Detectors</h3>
              <p>Smoke & heat sensors</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Secure Your Property?</h2>
            <p>Join thousands of satisfied customers who trust SecureTech</p>
            <div className="cta-buttons">
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Us
              </Link>
              {/* Admin Login removed from homepage - access via /admin/login directly */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;