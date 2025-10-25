// Simple test to verify the dashboard component
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FlipkartDashboard from './pages/FlipkartDashboard';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('FlipkartDashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders loading state initially', () => {
    render(
      <NotificationProvider>
        <CartProvider>
          <FlipkartDashboard />
        </CartProvider>
      </NotificationProvider>
    );
    
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  test('shows error when no token', async () => {
    render(
      <NotificationProvider>
        <CartProvider>
          <FlipkartDashboard />
        </CartProvider>
      </NotificationProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Please login to access dashboard')).toBeInTheDocument();
    });
  });

  test('shows user data when token exists', async () => {
    localStorage.setItem('token', 'test-token');
    
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          data: {
            _id: 'user123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            createdAt: new Date().toISOString()
          }
        });
      }
      if (url.includes('/api/orders/user')) {
        return Promise.resolve({
          data: []
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    render(
      <NotificationProvider>
        <CartProvider>
          <FlipkartDashboard />
        </CartProvider>
      </NotificationProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });
});
