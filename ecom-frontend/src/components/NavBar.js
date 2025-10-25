import React, { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaBoxOpen,
  FaHome,
  FaTachometerAlt,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus
} from "react-icons/fa";
import "./NavBar.css";
import { useCart } from "../contexts/CartContext";
import logo from "../assets/Newlogo.png";
import { AuthContext } from '../contexts/AuthContext';

const NavBar = ({ user }) => {
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const { cartItemCount } = useCart();
  const { isLoggedIn, logout, user: authUser } = useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setSearch(""); // Clear search after submission
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    setDropdown(false);
  };

  const handleNavLinkClick = () => {
    setDropdown(false);
  };

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="navbar-left" onClick={handleLogoClick}>
        <img src={logo} alt="Omegatec Logo" className="navbar-logo-img" />
      </div>

      <div className="navbar-right">
        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </form>

        {/* Navigation Links */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
          onClick={handleNavLinkClick}
        >
          <FaHome className="nav-link-icon" />
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `nav-link icon-link ${isActive ? 'active' : ''}`
          }
          title="Products"
          onClick={handleNavLinkClick}
        >
          <FaBoxOpen />
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `nav-link icon-link cart-btn ${isActive ? 'active' : ''}`
          }
          title="Cart"
          onClick={handleNavLinkClick}
        >
          <FaShoppingCart />
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </NavLink>

        {/* User Dropdown */}
        <div className="nav-user-dropdown" ref={dropdownRef}>
          <button
            className="nav-link icon-link user-btn"
            type="button"
            aria-expanded={dropdown}
            aria-haspopup="true"
            aria-label="User menu"
            onClick={() => setDropdown((d) => !d)}
          >
            <FaUser />
            {isLoggedIn && authUser && (
              <span className="user-indicator"></span>
            )}
          </button>
          
          {dropdown && (
            <div className="dropdown-menu show">
              {!isLoggedIn ? (
                <>
                  <NavLink
                    to="/login"
                    className="dropdown-item"
                    onClick={() => setDropdown(false)}
                  >
                    <FaSignInAlt className="dropdown-icon" />
                    <span>Login</span>
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="dropdown-item"
                    onClick={() => setDropdown(false)}
                  >
                    <FaUserPlus className="dropdown-icon" />
                    <span>Sign Up</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="dropdown-header">
                    <span className="dropdown-welcome">
                      Welcome, {authUser?.name || authUser?.email?.split('@')[0] || 'User'}!
                    </span>
                  </div>
                  <NavLink
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setDropdown(false)}
                  >
                    <FaTachometerAlt className="dropdown-icon" />
                    <span>Dashboard</span>
                  </NavLink>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
