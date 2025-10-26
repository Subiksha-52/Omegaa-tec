import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import './ModernNavBar.css';

const ModernNavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="flipkart-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <span className="logo-text">Omeegaa<span className="logo-accent">Tec</span></span>
          </div>
        </Link>

        {/* Search removed per request (search icon and command box hidden) */}

        {/* Navigation Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <Link to="/dashboard" className="user-link">
                <FaUser />
                <span>{user?.firstName || 'Account'}</span>
              </Link>
              <div className="user-dropdown">
                <Link to="/dashboard" className="dropdown-item">My Account</Link>
                <Link to="/user-orders" className="dropdown-item">My Orders</Link>
                <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <FaUser />
              <span>Login</span>
            </Link>
          )}


        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default ModernNavBar;
