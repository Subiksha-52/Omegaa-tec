import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FaCheckCircle, FaHome, FaShoppingBag, FaTruck } from "react-icons/fa";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="order-success-container">
        <div className="error-state">
          <FaCheckCircle size={60} />
          <h2>No order found</h2>
          <p>Please check your order history or contact support if you believe this is an error.</p>
          <Link to="/" className="continue-shopping-btn">
            <FaHome style={{ marginRight: '0.5rem' }} />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>

        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        <div className="order-details">
          <h3>Order Details</h3>
          <ul className="order-items">
            {order.items && order.items.map((item, idx) => (
              <li key={idx} className="order-item">
                <span className="order-item-name">{String(item.name || item.product?.name || "Product")}</span>
                <span className="order-item-quantity">&times; {Number(item.quantity)}</span>
                <span className="order-item-price">₹{Number(item.price || item.product?.price || 0)}</span>
              </li>
            ))}
          </ul>
          <div className="order-total">
            <span className="order-total-label">Total Amount</span>
            <span className="order-total-amount">₹{Number(order.grandTotal || order.total || 0)}</span>
          </div>
        </div>

        <div className="shipping-info">
          <p>Shipping to:</p>
          <p className="shipping-address">
            {order.address?.name && `${String(order.address.name)}, `}
            {order.address?.line1 && `${String(order.address.line1)}, `}
            {order.address?.city && `${String(order.address.city)}, `}
            {order.address?.state && `${String(order.address.state)} `}
            {order.address?.postalCode && String(order.address.postalCode)}
          </p>
          {order.shipping && (
            <div className="shipping-details">
              <p>Method: {String(order.shipping.method) || 'N/A'}</p>
              <p>Carrier: {String(order.shipping.carrier) || 'N/A'}</p>
              <p>Tracking Number: {String(order.shipping.trackingNumber) || 'N/A'}</p>
              <p>Estimated Delivery: {order.shipping.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : 'N/A'}</p>
              <p>Shipping Cost: ₹{Number(order.shipping.shippingCost) || 0}</p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn-primary">
            <FaHome />
            Continue Shopping
          </Link>
          <Link to="/user-orders" className="btn-secondary">
            <FaShoppingBag />
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
