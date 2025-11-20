import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser, FaMapMarkerAlt, FaGooglePay, FaMoneyBillWave, FaUniversity, FaCreditCard, FaShieldAlt, FaTruck, FaCheckCircle, FaLock, FaArrowRight, FaPlus, FaMinus } from "react-icons/fa";
import "./Checkout.css";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [checkoutData, setCheckoutData] = useState(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [user, setUser] = useState({ name: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [selectedBank, setSelectedBank] = useState('');
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("gpay");

  const { token, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    console.log("Location State:", location.state);
    // Check if user came from "Buy Now" or cart
    if (location.state?.product) {
      setIsBuyNow(true);
      const product = location.state.product;
      const quantity = location.state.quantity || 1;
      const totalAmount = product.price * quantity;

      setCheckoutData({
        items: [{
          product: product,
          quantity: quantity
        }],
        totalAmount: totalAmount
      });
    } else if (location.state?.cart) {
      setIsBuyNow(false);
      setCheckoutData(location.state.cart);
    }
  }, [location.state]);

  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="error-state">
          <FaCheckCircle size={60} />
          <h2>No products to checkout</h2>
          <p>Please add items to your cart or select a product to purchase.</p>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handleInput = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setSelectedPaymentOption(method);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCheckoutData(prevData => {
      const updatedItems = prevData.items.map(item => {
        if (item.product._id === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      const newTotalAmount = updatedItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

      return {
        ...prevData,
        items: updatedItems,
        totalAmount: newTotalAmount
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!user.name.trim() || !user.address.trim()) {
      setLoading(false);
      setError("Please fill in all required fields.");
      return;
    }

    // GPay/UPI via Razorpay
    if (paymentMethod === "gpay" || paymentMethod === "upi") {
      if (!upiId.match(/^[\w.-]+@[\w.-]+$/)) {
        setLoading(false);
        setError("Please enter a valid UPI ID (e.g. name@bank)");
        return;
      }
      try {
        // 1. Create order on backend
        if (!isLoggedIn || !token) {
          setLoading(false);
          setError('Please login to place an order');
          return;
        }

        const orderRes = await api.post('/api/payment/create-order', {
          amount: checkoutData.totalAmount,
        });
        const { id: order_id, amount, currency } = orderRes.data;

        // 2. Open Razorpay checkout
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_7ALd8ndNWkk7vu",
          amount: amount,
          currency: currency,
          name: "Omegaatec",
          description: "Order Payment",
          order_id: order_id,
          handler: async function (response) {
            // 3. Verify payment signature first
            try {
              if (!isLoggedIn || !token) {
                setError('Please login to place an order');
                setLoading(false);
                return;
              }
              const verifyRes = await api.post('/api/payment/verify-signature', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.success) {
                // 4. On verification success, save order in DB
        const orderData = {
          address: {
            name: user.name,
            line1: user.address,
            city: "",
            state: "",
            postalCode: "",
            country: "India"
          },
          shipping: {
            method: "standard"
          },
          discount: 0,
          paymentMethod: "gpay",
          upiId,
          items: checkoutData.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          })),
          total: checkoutData.totalAmount,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          paymentStatus: 'paid'
        };
                const saveRes = await api.post('/api/orders', orderData);
                setLoading(false);
                navigate("/order-success", { state: { order: saveRes.data } });
              } else {
                setLoading(false);
                setError("Payment verification failed. Please contact support.");
              }
            } catch (err) {
              setLoading(false);
              setError(err.response?.data?.error || "Order could not be placed. Please try again.");
            }
          },
          prefill: {
            name: user.name,
            email: "", // Optionally add user email
            contact: "" // Optionally add user phone
          },
          theme: {
            color: "#667eea"
          },
          method: {
            upi: (paymentMethod === 'gpay' || paymentMethod === 'upi'),
            card: false,
            netbanking: (paymentMethod === 'netbanking'),
            wallet: false
          },
          upi: (paymentMethod === 'gpay' || paymentMethod === 'upi') ? {
            flow: "collect",
            vpa: upiId
          } : undefined,
          netbanking: (paymentMethod === 'netbanking' && selectedBank) ? { bank: selectedBank } : undefined
        };
        setLoading(false);
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        setLoading(false);
        setError("Payment failed. Please try again.");
      }
      return;
    }

    // For Cash on Delivery
    try {
      const orderData = {
        address: {
          name: user.name,
          line1: user.address,
          city: "",
          state: "",
          postalCode: "",
          country: "India"
        },
        shipping: {
          method: "standard"
        },
        discount: 0,
        paymentMethod: paymentMethod,
        items: checkoutData.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        total: checkoutData.totalAmount
      };
      if (!isLoggedIn || !token) {
        setLoading(false);
        setError('Please login to place an order');
        return;
      }
      const response = await api.post('/api/orders', orderData);
      setLoading(false);
      navigate("/order-success", { state: { order: response.data } });
            } catch (err) {
              setLoading(false);
              setError(err.response?.data?.error || "Order could not be placed. Please try again.");
            }
  };

  const calculateSubtotal = () => {
    return checkoutData.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateSavings = () => {
    return checkoutData.items.reduce((total, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      return total + ((originalPrice - item.product.price) * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping - savings;

  return (
    <div className="checkout-container">
      <div className="checkout-main">
        {/* Order Summary */}
        <div className="checkout-summary">
          <h1>
            <FaCreditCard style={{ marginRight: '0.5rem' }} />
            Order Summary
          </h1>

          <div className="order-items">
            {checkoutData.items.map(item => (
              <div key={item.product._id} className="order-item">
                <div className="item-image">
                  <img
                    src={`https://omegaa-tec-1.onrender.com${item.product.image}`}
                    alt={item.product.name}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p className="item-brand">{item.product.brand || 'Brand'}</p>
                  <div className="item-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`star ${i < (item.product.rating || 0) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-text">
                      {item.product.rating ? item.product.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <div className="item-price-qty">
                    <span className="item-price">₹{item.product.price}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <div className="item-total">
                    <strong>₹{item.product.price * item.quantity}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal ({checkoutData.items.length} items)</span>
              <span>₹{subtotal}</span>
            </div>

            {savings > 0 && (
              <div className="price-row savings">
                <span>Total Savings</span>
                <span>-₹{savings}</span>
              </div>
            )}

            <div className="price-row">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'free-shipping' : ''}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>

            <div className="price-divider"></div>

            <div className="price-row total">
              <span>Total Amount</span>
              <span className="total-amount">₹{total}</span>
            </div>
          </div>

          <div className="order-benefits">
            <div className="benefit-item">
              <FaShieldAlt />
              <span>100% Secure Payment</span>
            </div>
            <div className="benefit-item">
              <FaTruck />
              <span>Free Shipping on ₹500+</span>
            </div>
            <div className="benefit-item">
              <FaCheckCircle />
              <span>Authentic Products</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>
            <FaUser style={{ marginRight: '0.5rem' }} />
            Shipping & Payment Details
          </h2>

          {/* Shipping Information */}
          <div className="form-section">
            <h3>Shipping Information</h3>

            <div className="input-icon-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={user.name}
                onChange={handleInput}
                required
              />
            </div>

            <div className="input-icon-group">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                name="address"
                placeholder="Complete Shipping Address"
                value={user.address}
                onChange={handleInput}
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section payment-integration">
            <h3>
              <FaLock style={{ marginRight: '0.5rem' }} />
              Payment Method
            </h3>

            <div className="payment-methods">
              <label
                className={`payment-option ${selectedPaymentOption === "gpay" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("gpay")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="gpay"
                  checked={paymentMethod === "gpay"}
                  onChange={() => handlePaymentMethodChange("gpay")}
                />
                <FaGooglePay style={{ color: "#667eea", fontSize: "1.5rem" }} />
                <span>Google Pay (UPI)</span>
              </label>

              <label
                className={`payment-option ${selectedPaymentOption === "upi" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("upi")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => handlePaymentMethodChange("upi")}
                />
                <FaUniversity style={{ color: "#667eea", fontSize: "1.4rem" }} />
                <span>UPI (PhonePe, Paytm, etc.)</span>
              </label>

              <label
                className={`payment-option ${selectedPaymentOption === "netbanking" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("netbanking")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={paymentMethod === "netbanking"}
                  onChange={() => handlePaymentMethodChange("netbanking")}
                />
                <FaUniversity style={{ color: "#667eea", fontSize: "1.4rem" }} />
                <span>Netbanking</span>
              </label>

              <label
                className={`payment-option ${selectedPaymentOption === "cod" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("cod")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => handlePaymentMethodChange("cod")}
                />
                <FaMoneyBillWave style={{ color: "#667eea", fontSize: "1.4rem" }} />
                <span>Cash on Delivery</span>
              </label>
            </div>

            {(paymentMethod === "gpay" || paymentMethod === "upi") && (
              <div className="upi-input-section">
                <input
                  type="text"
                  name="upiId"
                  placeholder="Enter UPI ID (e.g. name@bank)"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  required
                />
                <p className="upi-help">
                  Enter your UPI ID in the format: username@bankname
                </p>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="netbanking-section">
                <p>Select your bank (optional). The Razorpay checkout will also show available netbanking options.</p>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                  <option value="">-- Select Bank (optional) --</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="cod-info">
                <FaMoneyBillWave style={{ marginRight: '0.5rem' }} />
                Pay with cash when your order is delivered to your doorstep.
                <br />
                <small>Additional charges may apply for COD orders.</small>
              </div>
            )}
          </div>

          {/* Place Order Button */}
          <button type="submit" className="payment-button" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <FaLock style={{ marginRight: '0.5rem' }} />
                Place Order
                <FaArrowRight style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              <FaCheckCircle style={{ marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          <div className="checkout-footer">
            <p>
              <FaShieldAlt style={{ marginRight: '0.5rem' }} />
              Your payment information is secure and encrypted.
            </p>
            <p>
              <FaTruck style={{ marginRight: '0.5rem' }} />
              Estimated delivery: 3-5 business days.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
