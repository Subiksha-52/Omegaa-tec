import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import './CartPage.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowRight, FaCreditCard, FaShieldAlt } from 'react-icons/fa';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cart');
      setCart(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await api.post('/api/cart/edit', { productId, quantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.post('/api/cart/remove', { productId });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', { state: { cart } });
  };

  const calculateSavings = () => {
    return cart.items.reduce((total, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      const discount = originalPrice - item.product.price;
      return total + (discount * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">
        <FaShoppingCart style={{ marginRight: '0.5rem' }} />
        Your Shopping Cart
      </h2>

      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-cart-icon">
            <FaShoppingCart size={80} />
          </div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
            <FaArrowRight style={{ marginRight: '0.5rem' }} />
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header">
              <h3>Cart Items ({cart.items.length})</h3>
            </div>
            <ul className="cart-list">
              {cart.items.map(item => (
                <li key={item.product._id} className="cart-item">
                  <div className="item-image">
                    <img
                      className="cart-item-img"
                      src={`https://omegaa-tec-1.onrender.com${item.product.image}`}
                      alt={item.product.name}
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="item-info">
                      <h4 className="cart-item-name">{item.product.name}</h4>
                      <p className="cart-item-brand">{item.product.brand || 'Brand'}</p>
                      <div className="item-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`star ${i < (item.product.rating || 0) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-text">
                          {item.product.rating ? item.product.rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </div>

                    <div className="item-pricing">
                      <div className="price-info">
                        <span className="cart-item-price">₹{item.product.price}</span>
                        {item.product.originalPrice && (
                          <span className="original-price">₹{item.product.originalPrice}</span>
                        )}
                      </div>
                      {item.product.originalPrice && (
                        <div className="discount-badge">
                          Save ₹{(item.product.originalPrice - item.product.price) * item.quantity}
                        </div>
                      )}
                    </div>

                    <div className="item-controls">
                      <div className="cart-item-qty">
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateQty(item.product._id, parseInt(e.target.value) || 1)}
                        />
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.product._id, item.quantity + 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.product._id)}
                      >
                        <FaTrash style={{ marginRight: '0.5rem' }} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-header">
              <h3>
                <FaCreditCard style={{ marginRight: '0.5rem' }} />
                Order Summary
              </h3>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>₹{cart.totalAmount + calculateSavings()}</span>
              </div>

              {calculateSavings() > 0 && (
                <div className="summary-row discount">
                  <span>Total Savings</span>
                  <span>-₹{calculateSavings()}</span>
                </div>
              )}

              <div className="summary-row shipping">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total Amount</span>
                <span className="cart-total">₹{cart.totalAmount}</span>
              </div>
            </div>

            <div className="security-badges">
              <div className="security-item">
                <FaShieldAlt />
                <span>Secure Checkout</span>
              </div>
              <div className="security-item">
                <FaShieldAlt />
                <span>100% Authentic</span>
              </div>
            </div>

            <button className="buy-now-btn" onClick={handleBuyNow}>
              <FaCreditCard style={{ marginRight: '0.5rem' }} />
              Proceed to Checkout
              <FaArrowRight style={{ marginLeft: '0.5rem' }} />
            </button>

            <div className="checkout-info">
              <p>Free shipping on orders above ₹500</p>
              <p>Easy returns & exchanges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
