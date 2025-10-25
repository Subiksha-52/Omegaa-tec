import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext({
  token: null,
  user: null,
  isLoggedIn: false,
  login: (token, user) => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // when token changes, set axios default header and fetch profile
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // fetch profile
      (async () => {
        try {
          const res = await api.get('/api/auth/profile');
          if (res && res.data) setUser(res.data);
        } catch (err) {
          console.warn('Failed to fetch profile:', err);
          if (err.response?.status === 401) {
            // invalid token
            logout();
          }
        }
      })();
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') setToken(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    if (newUser) setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
