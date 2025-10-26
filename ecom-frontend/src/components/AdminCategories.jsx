import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
  const response = await api.get('/api/categories');
  setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingId) {
        await api.put(`/api/categories/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post('/api/categories', formData);
      }

      setFormData({ name: '' });
      setShowAddForm(false);
      fetchCategories();
    } catch (err) {
      setError(editingId ? 'Failed to update category' : 'Failed to add category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name });
    setEditingId(category._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
  await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>CATEGORIES MANAGEMENT</h3>
        </div>
        <div className='loading'>Loading categories...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='main-container'>
        <div className='main-title'>
          <h3>CATEGORIES MANAGEMENT</h3>
        </div>
        <div className='error'>{error}</div>
      </main>
    );
  }

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>CATEGORIES MANAGEMENT</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showAddForm && (
        <div className="category-form-container">
          <form onSubmit={handleSubmit} className="category-form">
            <input
              type="text"
              name="name"
              placeholder="Category Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <button type="submit" disabled={loading}>
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
          </form>
        </div>
      )}

      <div className='categories-table'>
        <table>
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>
                  <button className='btn-edit' onClick={() => handleEdit(category)}>Edit</button>
                  <button className='btn-delete' onClick={() => handleDelete(category._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default AdminCategories;
