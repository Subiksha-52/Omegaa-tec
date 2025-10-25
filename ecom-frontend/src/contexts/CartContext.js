import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

export { CartContext };

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const { token } = useContext(AuthContext);

  const fetchCart = async () => {
    if (token) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get('/api/cart', { headers });
        const items = response.data?.items || [];
        setCartItems(items);
        setCartItemCount(items.length);
      } catch (error) {
        console.error('Error fetching cart:', error);
        if (error.response?.status === 401) {
          // Token invalid, AuthContext should handle logout via storage event or interceptor
        }
        setCartItemCount(0);
        setCartItems([]);
      }
    } else {
      setCartItemCount(0);
      setCartItems([]);
    }
  };

  const updateCartItemCount = (count) => {
    setCartItemCount(count);
  };

  const addToCart = async (productId, quantity) => {
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await api.post('/api/cart/add', { productId, quantity }, { headers });
      await fetchCart(); // Refresh cart data
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Re-fetch cart whenever token changes (login/logout)
    fetchCart().catch(() => {});
  }, [token]);

  return (
    <CartContext.Provider value={{
      cartItemCount,
      cartItems,
      fetchCart,
      updateCartItemCount,
      addToCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
