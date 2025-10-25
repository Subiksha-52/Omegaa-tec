import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      const response = await api.get('/api/products', { headers });

      const productsPayload = response.data;
      const products = Array.isArray(productsPayload) ? productsPayload : productsPayload.products || [];

      // Calculate inventory stats
      const inventoryData = products.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        currentStock: product.stock || 0,
        lowStock: (product.stock || 0) < 10,
        lastUpdated: product.updatedAt || product.createdAt
      }));

      setInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = (item) => {
    setEditingItem(item.id);
    setNewStock(item.currentStock.toString());
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewStock('');
  };

  const handleUpdateStock = async (itemId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      await api.put(`/api/products/${itemId}/stock`, { stock: Number(newStock) }, { headers });
      fetchInventory();
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock');
    }
  };

  const handleEditProduct = (itemId) => {
    // Navigate to product edit page or open edit modal
    window.location.href = `/admin/products?edit=${itemId}`;
  };

  if (loading) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>INVENTORY MANAGEMENT</h3>
        </div>
        <div className='loading'>Loading inventory...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>INVENTORY MANAGEMENT</h3>
        </div>
        <div className='error'>{error}</div>
      </main>
    );
  }

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>INVENTORY MANAGEMENT</h3>
      </div>

      <div className='inventory-table'>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className={item.lowStock ? 'low-stock' : ''}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      min="0"
                      style={{ width: '80px' }}
                    />
                  ) : (
                    item.currentStock
                  )}
                </td>
                <td>
                  <span className={`status ${item.lowStock ? 'warning' : 'good'}`}>
                    {item.lowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                <td>
                  {editingItem === item.id ? (
                    <>
                      <button className='btn-save' onClick={() => handleUpdateStock(item.id)}>Save</button>
                      <button className='btn-cancel' onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className='btn-restock' onClick={() => handleRestock(item)}>Restock</button>
                      <button className='btn-edit' onClick={() => handleEditProduct(item.id)}>Edit</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default AdminInventory;
