import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    // Debug: Check if adminToken exists
    const adminToken = localStorage.getItem('adminToken');
    console.log('🔐 AdminSuppliers - adminToken in localStorage:', adminToken ? 'EXISTS' : 'MISSING');
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      console.log('📤 Fetching suppliers...');
      const response = await api.get('/api/suppliers');
      const payload = response.data;
      if (Array.isArray(payload)) setSuppliers(payload);
      else if (payload && Array.isArray(payload.suppliers)) setSuppliers(payload.suppliers);
      else setSuppliers([]);
    } catch (err) {
      setError('Failed to fetch suppliers');
      console.error('❌ Error fetching suppliers:', err.response?.data || err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        // Update supplier
        await api.put(`/api/suppliers/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Add new supplier
        await api.post('/api/suppliers', formData);
      }
      setFormData({ name: '', email: '', phone: '', address: '', contactPerson: '' });
      fetchSuppliers();
    } catch (err) {
      setError(editingId ? 'Failed to update supplier' : 'Failed to add supplier');
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await api.delete(`/api/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      setError('Failed to delete supplier');
      console.error(err);
    }
  };

  return (
    <div className="admin-suppliers">
      <h2>Manage Suppliers</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="supplier-form">
        <input
          type="text"
          name="name"
          placeholder="Supplier Name"
          value={formData.name}
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
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="contactPerson"
          placeholder="Contact Person"
          value={formData.contactPerson}
          onChange={handleInputChange}
          required
        />
        <button type="submit" disabled={loading}>
          {editingId ? 'Update Supplier' : 'Add Supplier'}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setFormData({ name: '', email: '', phone: '', address: '', contactPerson: '' });
          }}>
            Cancel
          </button>
        )}
      </form>

      <div className="suppliers-list">
        <h3>Suppliers List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Contact Person</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier._id}>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.contactPerson}</td>
                <td>
                  <button onClick={() => handleEdit(supplier)}>Edit</button>
                  <button onClick={() => handleDelete(supplier._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSuppliers;
