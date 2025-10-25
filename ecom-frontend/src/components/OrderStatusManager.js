import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import api from '../api';
import './OrderStatusManager.css';

const OrderStatusManager = ({ order, onStatusUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ff9800' },
    { value: 'processed', label: 'Processed', color: '#2196f3' },
    { value: 'packed', label: 'Packed', color: '#9c27b0' },
    { value: 'shipped', label: 'Shipped', color: '#4caf50' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#ff5722' },
    { value: 'delivered', label: 'Delivered', color: '#8bc34a' },
    { value: 'cancelled', label: 'Cancelled', color: '#f44336' },
    { value: 'returned', label: 'Returned', color: '#795548' },
    { value: 'refunded', label: 'Refunded', color: '#607d8b' }
  ];

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/api/orders/${order._id}/status`, {
        status: newStatus,
        note: note || `Order status changed to ${newStatus}`
      });
      
      onStatusUpdate(response.data.order);
      setIsEditing(false);
      setNote('');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#666';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  if (isEditing) {
    return (
      <div className="order-status-editor">
        <div className="status-form">
          <div className="form-group">
            <label>New Status:</label>
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              className="status-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Note (Optional):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this status change..."
              className="status-note"
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              onClick={handleStatusUpdate}
              disabled={loading}
              className="btn btn-primary"
            >
              <FaSave /> {loading ? 'Updating...' : 'Update Status'}
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-status-display">
      <div className="current-status">
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {getStatusLabel(order.status)}
        </span>
        <button 
          onClick={() => setIsEditing(true)}
          className="edit-status-btn"
          title="Change order status"
        >
          <FaEdit />
        </button>
      </div>
      
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="status-history">
          <h4>Status History:</h4>
          <div className="timeline">
            {order.statusHistory.slice().reverse().map((entry, index) => (
              <div key={index} className="timeline-item">
                <div 
                  className="timeline-marker"
                  style={{ backgroundColor: getStatusColor(entry.status) }}
                />
                <div className="timeline-content">
                  <strong>{getStatusLabel(entry.status)}</strong>
                  <span className="timeline-date">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  {entry.note && (
                    <p className="timeline-note">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusManager;
