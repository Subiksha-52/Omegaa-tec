import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaTh, FaList, FaTag, FaMapMarkerAlt, FaSearch, FaShoppingCart, FaBolt, FaFilter, FaStar, FaHeart, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import './ProductList.css';

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { addToCart: addToCartContext } = useCart();

  // Fetch categories
  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      });
  }, []);

  // Fetch products
  const fetchProducts = (page = currentPage) => {
    setLoading(true);
    const params = {};
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();
    if (minPrice) params.min = minPrice;
    if (maxPrice) params.max = maxPrice;
    params.page = page;
    params.limit = 12;
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;

    api.get('/api/products', { params })
      .then(res => {
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        setPagination(res.data.pagination || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts([]);
        setPagination({});
        setLoading(false);
      });
  };

  // Fetch on category or search change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [selectedCategory]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

const addToCart = async (productId, quantity) => {
    try {
        await addToCartContext(productId, quantity);
        showSuccess('Added to cart!');
    } catch (error) {
        showError('Failed to add to cart.');
    }
};

  const handleBuyNow = (product) => {
    navigate('/checkout', { state: { product } });
  };

  // Navigate to product details
  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="flipkart-product-list">
      <div className="product-list-container">
        {/* Sidebar */}
        <aside className="product-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <FaFilter />
              Categories
            </h3>
            <ul className="category-list">
              <li
                className={`category-item ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Products
              </li>
              {categories.map(cat => (
                <li
                  key={cat._id}
                  className={`category-item ${selectedCategory === cat.name ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Price Range</h3>
            <div className="price-filter">
              <input
                type="number"
                className="price-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                className="price-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <button
                className="apply-filter-btn"
                onClick={() => fetchProducts()}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="filter-option">
              <input
                type="checkbox"
                id="hideOutOfStock"
                checked={hideOutOfStock}
                onChange={(e) => setHideOutOfStock(e.target.checked)}
              />
              <label htmlFor="hideOutOfStock">Hide out of stock</label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="product-main-content">
          {/* Header */}
          <div className="product-header">
            <div className="header-top">
              <h1 className="page-title">
                {selectedCategory === "all" ? "All Products" : selectedCategory}
              </h1>
              <div className="view-toggle">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaTh />
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FaList />
                </button>
              </div>
            </div>

            <div className="search-sort-row">
              <form className="search-form product-search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for products, brands and more"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <FaSearch />
                </button>
              </form>

              <div className="sort-group">
                <label className="sort-label">Sort by:</label>
                <select
                  className="sort-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                    fetchProducts();
                  }}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Customer Rating</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {loading && <div className="loading-text">Loading products...</div>}

          {/* Product Grid */}
          <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {products.filter(product => !hideOutOfStock || (product.stock > 0)).map(product => (
              <div
                key={product._id}
                className={`product-card ${viewMode === 'list' ? 'list-view' : ''}`}
              >
                <div className="product-image-container">
                  <img
                    src={`https://omegaa-tec-1.onrender.com${product.image}`}
                    alt={product.name}
                    className="product-image"
                    onClick={() => handleProductClick(product._id)}
                  />
                  {product.discount > 0 && (
                    <div className="discount-badge">
                      <FaTag /> {product.discount}% OFF
                    </div>
                  )}
                  <div className="product-actions-overlay">
                    <button
                      className="action-btn wishlist-btn"
                      title="Add to Wishlist"
                    >
                      <FaHeart />
                    </button>
                    <button
                      className="action-btn quick-view-btn"
                      title="Quick View"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <h4 className="product-name" onClick={() => handleProductClick(product._id)}>
                    {product.name}
                  </h4>
                  {product.brand && <p className="product-brand">{product.brand}</p>}
                  
                  <div className="product-rating">
                    <div className="rating-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          className={`rating-star ${i < (product.rating || 0) ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="rating-count">
                      ({product.ratingCount || 0})
                    </span>
                  </div>

                  <div className="product-price-row">
                    <span className="current-price">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="original-price">₹{product.originalPrice}</span>
                    )}
                    {product.discount > 0 && (
                      <span className="discount-text">{product.discount}% off</span>
                    )}
                  </div>

                  {product.stockLocation && (
                    <div className="product-location">
                      <FaMapMarkerAlt /> {product.stockLocation}
                    </div>
                  )}

                  <div className="product-actions">
                    <button
                      className="buy-now-btn"
                      onClick={e => { e.stopPropagation(); handleBuyNow(product); }}
                    >
                      <FaBolt />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-button"
                onClick={() => { setCurrentPage(pagination.currentPage - 1); fetchProducts(pagination.currentPage - 1); }}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-button ${page === pagination.currentPage ? 'active' : ''}`}
                  onClick={() => { setCurrentPage(page); fetchProducts(page); }}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-button"
                onClick={() => { setCurrentPage(pagination.currentPage + 1); fetchProducts(pagination.currentPage + 1); }}
                disabled={!pagination.hasNextPage}
              >
                Next
              </button>
            </div>
          )}

          {/* Results info */}
          {pagination.totalProducts > 0 && (
            <div className="results-info">
              Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalProducts)} of {pagination.totalProducts} products
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;
