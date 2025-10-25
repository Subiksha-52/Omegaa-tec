import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newNotification = { id, message, type, duration };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration = 3000) => {
    addNotification(message, 'success', duration);
  };

  const showError = (message, duration = 3000) => {
    addNotification(message, 'error', duration);
  };

  const showInfo = (message, duration = 3000) => {
    addNotification(message, 'info', duration);
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
