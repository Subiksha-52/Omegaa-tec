import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';

function AdminReports() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    fetchReports();
  }, [token, isLoggedIn]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Get admin token for authenticated requests
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      // Fetch data from different endpoints
      const [salesResponse, usersResponse, productsResponse] = await Promise.all([
        api.get('/api/orders/stats', { headers }).catch(err => ({ data: { totalOrders: 0, totalRevenue: 0, monthlyRevenue: [], averageOrderValue: 0 } })),
        api.get('/api/users/stats', { headers }).catch(err => ({ data: { totalUsers: 0, verifiedUsers: 0, newUsersToday: 0 } })),
        api.get('/api/products', { headers }).catch(err => ({ data: { products: [] } }))
      ]);

      setReports({
        sales: salesResponse.data,
        users: usersResponse.data,
        products: Array.isArray(productsResponse.data) ? productsResponse.data.length : (productsResponse.data.products?.length || 0)
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>REPORTS & ANALYTICS</h3>
        </div>
        <div className='loading'>Loading reports...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>REPORTS & ANALYTICS</h3>
        </div>
        <div className='error'>{error}</div>
      </main>
    );
  }

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>REPORTS & ANALYTICS</h3>
      </div>

      <div className='reports-cards'>
        <div className='card'>
          <div className='card-inner'>
            <h3>SALES REPORT</h3>
            <span className='card_icon'>💰</span>
          </div>
          <h1>₹{reports.sales?.totalRevenue || 0}</h1>
          <p>Total Revenue</p>
        </div>

        <div className='card'>
          <div className='card-inner'>
            <h3>ORDERS</h3>
            <span className='card_icon'>📦</span>
          </div>
          <h1>{reports.sales?.totalOrders || 0}</h1>
          <p>Total Orders</p>
        </div>

        <div className='card'>
          <div className='card-inner'>
            <h3>CUSTOMERS</h3>
            <span className='card_icon'>👥</span>
          </div>
          <h1>{reports.users?.totalUsers || 0}</h1>
          <p>Total Customers</p>
        </div>

        <div className='card'>
          <div className='card-inner'>
            <h3>PRODUCTS</h3>
            <span className='card_icon'>📊</span>
          </div>
          <h1>{reports.products || 0}</h1>
          <p>Total Products</p>
        </div>
      </div>

      <div className='reports-details'>
        <h4>Detailed Reports</h4>
        <div className='report-section'>
          <h5>Monthly Sales: ₹{reports.sales?.monthlyRevenue?.reduce((sum, month) => sum + month.monthlyRevenue, 0) || 0}</h5>
          <h5>Average Order Value: ₹{reports.sales?.averageOrderValue?.toFixed(2) || 0}</h5>
          <h5>New Customers Today: {reports.users?.newUsersToday || 0}</h5>
        </div>
      </div>
    </main>
  );
}

export default AdminReports;
