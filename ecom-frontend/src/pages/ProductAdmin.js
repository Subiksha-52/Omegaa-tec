import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductAdmin.css';

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', qty: '', price: '', description: '', image: null });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchase, setPurchase] = useState({ qty: '', supplierId: '' });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('/api/products');
    setProducts(res.data);
  };

  const fetchSuppliers = async () => {
    const res = await axios.get('/api/suppliers');
    setSuppliers(res.data);
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (selectedProduct) {
      await axios.put(`/api/products/${selectedProduct._id}`, formData);
    } else {
      await axios.post('/api/products', formData);
    }
    setForm({ name: '', qty: '', price: '', description: '', image: null });
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleEdit = product => {
    setSelectedProduct(product);
    setForm({ ...product, image: null });
  };

  const handleDelete = async id => {
    await axios.delete(`/api/products/${id}`);
    fetchProducts();
  };

  const handlePurchase = async (id) => {
    await axios.post(`/api/products/${id}/purchase`, purchase);
    setPurchase({ qty: '', supplierId: '' });
    fetchProducts();
  };

  return (
    <div className="ProductAdmin-container">
      <h2>Product Admin</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="qty" value={form.qty} onChange={handleChange} placeholder="Qty" type="number" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="image" type="file" onChange={handleChange} accept="image/*" />
        <button type="submit">{selectedProduct ? 'Update' : 'Add'} Product</button>
      </form>
      <h3>Products</h3>
      <ul>
        {products.map(p => (
          <li key={p._id}>
            <img src={`http://localhost:5000${p.image}`} alt={p.name} width={50} />
            {p.name} (Qty: {p.qty}) - ${p.price}
            <button onClick={() => handleEdit(p)}>Edit</button>
            <button onClick={() => handleDelete(p._id)}>Delete</button>
            <form onSubmit={e => { e.preventDefault(); handlePurchase(p._id); }}>
              <input
                name="qty"
                value={purchase.qty}
                onChange={e => setPurchase(prev => ({ ...prev, qty: e.target.value }))}
                placeholder="Add Qty"
                type="number"
                min="1"
                required
              />
              <select
                name="supplierId"
                value={purchase.supplierId}
                onChange={e => setPurchase(prev => ({ ...prev, supplierId: e.target.value }))}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <button type="submit">Purchase</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductAdmin;
