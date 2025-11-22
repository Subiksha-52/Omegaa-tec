import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminHome from '../components/AdminHome';
import AdminProducts from '../components/AdminProducts';
import AdminCategories from '../components/AdminCategories';
import AdminCustomers from '../components/AdminCustomers';
import AdminInventory from '../components/AdminInventory';
import AdminReports from '../components/AdminReports';
import AdminSettings from '../components/AdminSettings';

import "../components/AdminDashboard.css";

const AdminDashboard = () => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in with a valid token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    
    // Optional: You can validate the token on the backend if needed
    // For now, a simple client-side check is sufficient
  }, [navigate]);

  const toggleSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminHome />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'customers':
        return <AdminCustomers />;
      case 'inventory':
        return <AdminInventory />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return <AdminSettings />;

      default:
        return <AdminHome />;
    }
  };

  return (
    <div className='grid-container'>
      <AdminHeader OpenSidebar={toggleSidebar}/>
      <AdminSidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={toggleSidebar}
        onNavigate={handleNavigation}
        currentView={currentView}
      />
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
