import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill, BsCurrencyDollar } from 'react-icons/bs';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie } from 'recharts';

function AdminHome() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0,
    sales: 0,
    orders: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, [token, isLoggedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get admin token for authenticated requests
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      // Fetch data in parallel
      const [productsRes, categoriesRes, usersRes, ordersRes] = await Promise.all([
        api.get('/api/products', { headers }),
        api.get('/api/categories', { headers }),
        api.get('/api/users/stats', { headers }),
        api.get('/api/orders', { headers })
      ]);

      const ordersPayload = ordersRes.data;
      const ordersArray = Array.isArray(ordersPayload) ? ordersPayload : ordersPayload.orders || [];
      const totalSales = ordersArray.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

      const productsPayload = productsRes.data;
      const productsArray = Array.isArray(productsPayload) ? productsPayload : productsPayload.products || [];

      const categoriesPayload = categoriesRes.data;
      const categoriesArray = Array.isArray(categoriesPayload) ? categoriesPayload : categoriesPayload.categories || [];

      const usersPayload = usersRes.data || {};

      setStats({
        products: productsArray.length,
        categories: categoriesArray.length,
        customers: usersPayload.totalUsers || 0,
        sales: totalSales,
        orders: ordersArray.length,
        alerts: usersPayload.unverifiedUsers || 0
      });

      // Generate sample sales data for charts
      const salesChartData = generateSalesData(ordersArray);
      setSalesData(salesChartData);

      // Generate user growth data
      const growthData = generateUserGrowthData(usersRes.data);
      setUserGrowthData(growthData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err.response ? err.response.data : err.message);
      setError('Failed to load dashboard data');
      
      // Fallback to sample data for demo
      setStats({
        products: 150,
        categories: 12,
        customers: 89,
        sales: 12500,
        orders: 45,
        alerts: 23
      });
      
      setSalesData(generateSampleSalesData());
      setUserGrowthData(generateSampleGrowthData());
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = (orders) => {
    // Process real order data for charts
    const monthlySales = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt || new Date()).getMonth();
      monthlySales[month] = (monthlySales[month] || 0) + (order.grandTotal || 0);
    });

    return Object.entries(monthlySales).map(([month, sales]) => ({
      name: `Month ${parseInt(month) + 1}`,
      sales: sales
    }));
  };

  const generateUserGrowthData = (userStats) => {
    // Generate growth data based on user stats
    return [
      { name: 'Total', value: userStats.totalUsers },
      { name: 'Verified', value: userStats.verifiedUsers },
      { name: 'New Today', value: userStats.newUsersToday }
    ];
  };

  const generateSampleSalesData = () => {
    return [
      { name: 'Jan', sales: 4000, revenue: 2400 },
      { name: 'Feb', sales: 3000, revenue: 1398 },
      { name: 'Mar', sales: 2000, revenue: 9800 },
      { name: 'Apr', sales: 2780, revenue: 3908 },
      { name: 'May', sales: 1890, revenue: 4800 },
      { name: 'Jun', sales: 2390, revenue: 3800 }
    ];
  };

  const generateSampleGrowthData = () => {
    return [
      { name: 'Total', value: 89 },
      { name: 'Verified', value: 66 },
      { name: 'New Today', value: 5 }
    ];
  };

  if (loading) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>DASHBOARD</h3>
        </div>
        <div className='loading'>Loading dashboard data...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>DASHBOARD</h3>
        </div>
        <div className='error'>{error}</div>
      </main>
    );
  }

  return (
    <main className='main-container'>
        <div className='main-title'>
            <h3>DASHBOARD OVERVIEW</h3>
        </div>

        <div className='main-cards'>
            <div className='card'>
                <div className='card-inner'>
                    <h3>PRODUCTS</h3>
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>{stats.products}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>CATEGORIES</h3>
                    <BsFillGrid3X3GapFill className='card_icon'/>
                </div>
                <h1>{stats.categories}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>CUSTOMERS</h3>
                    <BsPeopleFill className='card_icon'/>
                </div>
                <h1>{stats.customers}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>TOTAL SALES</h3>
                    <BsCurrencyDollar className='card_icon'/>
                </div>
                <h1>${stats.sales.toLocaleString()}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>ORDERS</h3>
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>{stats.orders}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>ALERTS</h3>
                    <BsFillBellFill className='card_icon'/>
                </div>
                <h1>{stats.alerts}</h1>
            </div>
        </div>

        <div className='charts'>
            <div className='chart-section'>
                <h4>Monthly Sales Performance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
            </div>

            <div className='chart-section'>
                <h4>User Growth Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userGrowthData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userGrowthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </main>
  );
}

export default AdminHome;
