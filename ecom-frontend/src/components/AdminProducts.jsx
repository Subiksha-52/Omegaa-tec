import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    price: '',
    description: '',
    rating: '',
    features: '',
    specifications: '',
    featured: false
  });
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      const response = await api.get('/api/products', { headers });
      // The API returns { products: [...], pagination: {...} }
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      if (image) data.append('image', image);

      if (editingId) {
        await api.put(`/api/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditingId(null);
      } else {
        await api.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setFormData({
        name: '',
        category: '',
        stock: '',
        price: '',
        description: '',
        rating: '',
        features: '',
        specifications: '',
        featured: false
      });
      setImage(null);
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      setError(editingId ? 'Failed to update product' : 'Failed to add product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      category: product.category || '',
      stock: product.stock || '',
      price: product.price || '',
      description: product.description || '',
      rating: product.rating || '',
      features: product.features ? product.features.join(', ') : '',
      specifications: product.specifications ? JSON.stringify(product.specifications) : '',
      featured: product.featured || false
    });
    setEditingId(product._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    }
  };

  const handleRestock = async (id, currentStock) => {
    const stock = prompt('Enter stock to add:', '0');
    if (stock && !isNaN(stock)) {
      try {
        await api.post(`/api/products/${id}/purchase`, { stock: parseInt(stock) });
        fetchProducts();
      } catch (err) {
        setError('Failed to restock product');
        console.error(err);
      }
    }
  };

  if (loading && products.length === 0) {
    return <div className="admin-products">Loading products...</div>;
  }

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>PRODUCTS MANAGEMENT</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showAddForm && (
        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                step="0.1"
                name="rating"
                placeholder="Rating"
                value={formData.rating}
                onChange={handleInputChange}
              />
            </div>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
            <input
              type="text"
              name="features"
              placeholder="Features (comma separated)"
              value={formData.features}
              onChange={handleInputChange}
            />
            <textarea
              name="specifications"
              placeholder="Specifications (JSON)"
              value={formData.specifications}
              onChange={handleInputChange}
              rows="3"
            />
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                Featured Product
              </label>
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            <button type="submit" disabled={loading}>
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
              className="product-image"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <div className="product-info">
              <h4>{product.name}</h4>
              <p>Category: {product.category}</p>
              <p>Stock: {product.stock}</p>
              <p>Price: ₹{product.price}</p>
              <p>Rating: {product.rating || 'N/A'}</p>
              <div className="product-actions">
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product._id)}>Delete</button>
                <button onClick={() => handleRestock(product._id, product.stock)}>Restock</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminProducts;
