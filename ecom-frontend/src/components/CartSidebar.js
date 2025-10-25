import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './CartSidebar.css';
import { AuthContext } from '../contexts/AuthContext';
import { FaMinus, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';

const CartSidebar = ({ user, onClose, isOpen }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchCart = async () => {
      if (isLoggedIn && token) {
        setLoading(true);
        try {
          const response = await axios.get(`https://omegaa-tec-1.onrender.com/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCartItems(response.data.items);
          setTotalAmount(response.data.totalAmount);
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setCartItems([]);
        setTotalAmount(0);
      }
    };

    if (isOpen) {
      fetchCart();
    }
  }, [isLoggedIn, token, isOpen]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(`https://omegaa-tec-1.onrender.com/api/cart/update`, {
        productId,
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Recalculate total
      const updatedTotal = cartItems.reduce((total, item) => {
        if (item.product._id === productId) {
          return total + (item.product.price * newQuantity);
        }
        return total + (item.product.price * item.quantity);
      }, 0);
      setTotalAmount(updatedTotal);

    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`https://omegaa-tec-1.onrender.com/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      const updatedItems = cartItems.filter(item => item.product._id !== productId);
      setCartItems(updatedItems);

      // Recalculate total
      const updatedTotal = updatedItems.reduce((total, item) =>
        total + (item.product.price * item.quantity), 0
      );
      setTotalAmount(updatedTotal);

    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    onClose();
    window.location.href = '/checkout';
  };

  const handleViewCart = () => {
    onClose();
    window.location.href = '/cart';
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>
          <FaShoppingCart style={{ marginRight: '0.5rem' }} />
          Your Cart
        </h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="cart-content">
        {loading ? (
          <div className="cart-loading">
            <div className="spinner"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <p>Your cart is empty.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Add some products to get started!
            </p>
          </div>
        ) : (
          <ul className="cart-items">
            {cartItems.map(item => (
              <li key={item._id} className="cart-item">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.product.name}</h4>
                  <p className="cart-item-price">₹{item.product.price}</p>
                  <div className="cart-item-quantity">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.product._id)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="total-amount">
            <h3>Total:</h3>
            <span className="total-price">₹{totalAmount}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <button className="view-cart-btn" onClick={handleViewCart}>
            View Full Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;
