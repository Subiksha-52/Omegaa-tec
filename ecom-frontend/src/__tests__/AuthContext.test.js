import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import api from '../api';

jest.mock('../api');

test('AuthProvider fetches profile on login and provides user', async () => {
  api.get.mockImplementation((url) => {
    if (url === '/api/auth/profile') return Promise.resolve({ data: { _id: 'u1', firstName: 'Tester' } });
    return Promise.resolve({ data: {} });
  });

  let contextValue = null;

  function Consumer() {
    const ctx = React.useContext(AuthContext);
    contextValue = ctx;
    return <div>ok</div>;
  }

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

  // simulate login
  contextValue.login('fake-token', null);

  await waitFor(() => expect(contextValue.user).not.toBeNull());
  expect(contextValue.user.firstName).toBe('Tester');
  expect(api.get).toHaveBeenCalledWith('/api/auth/profile');
});
