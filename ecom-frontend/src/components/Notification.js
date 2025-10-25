import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}>×</button>
      </div>
    </div>
  );
};

export default Notification;
