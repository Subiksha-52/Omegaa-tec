import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModernNavBar from './components/ModernNavBar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import AboutUs from './pages/AboutUs';
import Gaming from './pages/Gaming';
import Activate from './pages/Activate';
import ProductAdmin from './pages/ProductAdmin';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Footer from './components/Footer';
import './App.css';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import FlipkartDashboard from './pages/FlipkartDashboard';
import UserOrderPage from './pages/UserOrderPage';
import OrderTracking from './pages/OrderTracking';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <BrowserRouter>
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <ModernNavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<FlipkartDashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/gaming" element={<Gaming />} />
          <Route path="/activate/:token" element={<Activate />} />
          <Route path="/product-admin" element={<ProductAdmin />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/user-orders" element={<UserOrderPage />} />
          <Route path="/track-order" element={<OrderTracking />} />
        </Routes>
        <Footer />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  </BrowserRouter>
);
export default App;
