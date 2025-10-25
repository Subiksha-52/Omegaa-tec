import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './ProductDetails.css';
import { FaHeart, FaShoppingCart, FaTruck, FaShieldAlt, FaUndo, FaShareAlt, FaStar, FaMapMarkerAlt, FaTag, FaBolt, FaEye, FaThumbsUp } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showShareModal, setShowShareModal] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [user, setUser] = useState(null);

  const { token, user: authUser, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (authUser) setUser(authUser);

    fetchProduct();
    fetchRelatedProducts();
    fetchReviews();
    checkWishlistStatus();
  }, [id, authUser]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await api.get(`/api/products/related/${id}`);
      setRelatedProducts(response.data);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/api/products/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/api/wishlist/${user._id}`);
      setIsWishlisted(response.data.some(item => item.productId === id));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!isLoggedIn || !token) {
        navigate('/login');
        return;
      }
      await api.post('/api/cart/add', {
        productId: product._id,
        quantity
      });

      showNotification('Added to cart!', 'success');
    } catch (error) {
      showNotification('Error adding to cart', 'error');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (!isLoggedIn || !token) {
        navigate('/login');
        return;
      }
      if (isWishlisted) {
        await api.delete('/api/wishlist/remove', {
          data: { productId: product._id }
        });
        setIsWishlisted(false);
        showNotification('Removed from wishlist', 'success');
      } else {
        await api.post('/api/wishlist/add', { productId: product._id });
        setIsWishlisted(true);
        showNotification('Added to wishlist!', 'success');
      }
    } catch (error) {
      showNotification('Error managing wishlist', 'error');
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 600;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const calculateDiscount = () => {
    if (product?.originalPrice && product.price < product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const handleImageZoom = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setIsZooming(true);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing ${product?.name}!`;

    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
        break;
      default:
        navigator.clipboard.writeText(url);
        showNotification('Link copied to clipboard!', 'success');
    }
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-container">
        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image-container">
            <img
              src={product.images?.[selectedImage] || product.image}
              alt={product.name}
              className="main-image"
              onMouseMove={handleImageZoom}
              onMouseLeave={() => setIsZooming(false)}
            />
            {isZooming && (
              <div
                className="zoom-lens"
                style={{
                  backgroundImage: `url(${product.images?.[selectedImage] || product.image})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
              />
            )}
          </div>

          <div className="thumbnail-gallery">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-actions-header">
              <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                title="Add to Wishlist"
              >
                <FaHeart />
              </button>
              <button
                className="share-btn"
                onClick={() => setShowShareModal(true)}
                title="Share"
              >
                <FaShareAlt />
              </button>
            </div>
          </div>

          <div className="product-meta">
            <div className="rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(averageRating) ? 'filled' : ''}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
            </div>
            <span className="sold-count">
              <FaEye style={{ marginRight: '0.5rem' }} />
              {product.sold || 0} sold
            </span>
          </div>

          <div className="price-section">
            <div className="current-price">₹{product.price}</div>
            {product.originalPrice && (
              <>
                <div className="original-price">₹{product.originalPrice}</div>
                <div className="discount-badge">
                  <FaTag style={{ marginRight: '0.5rem' }} />
                  {discount}% OFF
                </div>
              </>
            )}
          </div>

          <div className="stock-info">
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="product-highlights">
            <div className="highlight-item">
              <FaTruck />
              <span>Free shipping on orders over ₹500</span>
            </div>
            <div className="highlight-item">
              <FaShieldAlt />
              <span>100% Authentic guarantee</span>
            </div>
            <div className="highlight-item">
              <FaUndo />
              <span>30-day return policy</span>
            </div>
          </div>

          <div className="purchase-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn buy-now" onClick={() => {
                if (!isLoggedIn || !token) {
                  navigate('/login');
                  return;
                }
                navigate('/checkout', { state: { product, quantity } });
              }}>
                <FaShoppingCart /> Buy Now
              </button>
              <button className="btn add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>

          <div className="product-services">
            <div className="service-item">
              <FaTruck />
              <div>
                <strong>Free Delivery</strong>
                <span>On orders above ₹500</span>
              </div>
            </div>
            <div className="service-item">
              <FaUndo />
              <div>
                <strong>Easy Returns</strong>
                <span>30-day return policy</span>
              </div>
            </div>
            <div className="service-item">
              <FaShieldAlt />
              <div>
                <strong>Secure Payment</strong>
                <span>100% secure transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-details-tabs">
        <div className="tab-header">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h3>Product Description</h3>
              <p>{product.description}</p>
              {product.features && (
                <div className="features-list">
                  <h4>Key Features:</h4>
                  <ul>
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="specifications-content">
              <h3>Technical Specifications</h3>
              <div className="spec-table">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-key">{key}</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <h3>Customer Reviews</h3>
              <div className="reviews-summary">
                <div className="average-rating">
                  <span className="rating-number">{averageRating.toFixed(1)}</span>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(averageRating) ? 'filled' : ''}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="total-reviews">{reviews.length} reviews</span>
                </div>
              </div>

              {/* Review Submission Form */}
              {user && (
                <div className="review-form">
                  <h4>Write a Review</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const rating = formData.get('rating');
                    const comment = formData.get('comment');

                    try {
                        if (!isLoggedIn || !token) {
                          showNotification('Please login to submit review', 'error');
                          return;
                        }
                        const response = await api.post(`/api/products/${id}/reviews`, {
                        rating,
                        comment,
                        userId: user._id,
                        userName: `${user.firstName} ${user.lastName}`
                        });

                      // Add the new review to the list
                      setReviews([...reviews, response.data]);
                      showNotification('Review submitted successfully!', 'success');
                      e.target.reset();
                    } catch (error) {
                      showNotification('Failed to submit review', 'error');
                    }
                  }}>
                    <div className="form-group">
                      <label>Rating:</label>
                      <select name="rating" required>
                        <option value="">Select Rating</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Your Review:</label>
                      <textarea
                        name="comment"
                        placeholder="Share your experience with this product..."
                        required
                        rows="4"
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                  </form>
                </div>
              )}

              {!user && (
                <div className="review-login-prompt">
                  <p>Please <Link to="/login">login</Link> to write a review.</p>
                </div>
              )}

              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.userName}</span>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'filled' : ''}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2 className="section-title">
            <FaThumbsUp style={{ marginRight: '0.5rem' }} />
            Related Products
          </h2>
          <div className="related-products-grid">
            {relatedProducts.slice(0, 4).map(related => (
              <Link key={related._id} to={`/products/${related._id}`} className="related-product-card">
                <img src={related.image} alt={related.name} />
                <div className="related-product-info">
                  <h3>{related.name}</h3>
                  <p className="price">₹{related.price}</p>
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < (related.rating || 0) ? 'filled' : ''}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Share this product</h3>
            <div className="share-options">
              <button onClick={() => handleShare('facebook')}>
                <FaShareAlt style={{ marginRight: '0.5rem' }} />
                Facebook
              </button>
              <button onClick={() => handleShare('twitter')}>
                <FaShareAlt style={{ marginRight: '0.5rem' }} />
                Twitter
              </button>
              <button onClick={() => handleShare('whatsapp')}>
                <FaShareAlt style={{ marginRight: '0.5rem' }} />
                WhatsApp
              </button>
              <button onClick={() => handleShare('copy')}>
                <FaShareAlt style={{ marginRight: '0.5rem' }} />
                Copy Link
              </button>
            </div>
            <button className="close-modal" onClick={() => setShowShareModal(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
