import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isVerified: false
  });

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    fetchCustomers();
  }, [token, isLoggedIn]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      const response = await api.get('/api/users', { headers });
      const payload = response.data;
      if (Array.isArray(payload)) setCustomers(payload);
      else if (payload && Array.isArray(payload.users)) setCustomers(payload.users);
      else {
        console.warn('Unexpected customers payload:', payload);
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer._id);
    setFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      isVerified: customer.isVerified || false
    });
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', isVerified: false });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      await api.put(`/api/users/${editingCustomer}`, formData, { headers });
      fetchCustomers();
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('Failed to update customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      await api.delete(`/api/users/${id}`, { headers });
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>CUSTOMERS MANAGEMENT</h3>
        </div>
        <div className='loading'>Loading customers...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>CUSTOMERS MANAGEMENT</h3>
        </div>
        <div className='error'>{error}</div>
      </main>
    );
  }

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>CUSTOMERS MANAGEMENT</h3>
      </div>

      {editingCustomer && (
        <div className='edit-form-modal'>
          <form onSubmit={handleUpdate} className='edit-form'>
            <h4>Edit Customer</h4>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <label>
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleInputChange}
              />
              Verified
            </label>
            <div className='form-actions'>
              <button type="submit">Update</button>
              <button type="button" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className='customers-table'>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{`${customer.firstName || ''} ${customer.lastName || ''}`}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>
                  <span className={`status ${customer.isVerified ? 'verified' : 'unverified'}`}>
                    {customer.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>
                  <button className='btn-edit' onClick={() => handleEdit(customer)}>Edit</button>
                  <button className='btn-delete' onClick={() => handleDelete(customer._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default AdminCustomers;
