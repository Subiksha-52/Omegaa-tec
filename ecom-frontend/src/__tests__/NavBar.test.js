import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';

// mock api to avoid network calls
jest.mock('../api', () => ({
  defaults: { headers: { common: {} } },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

function TestControls() {
  const { login, logout } = useContext(AuthContext);
  return (
    <div>
      <button onClick={() => login('fake-token', { _id: 'u1', firstName: 'Test' })}>TEST_LOGIN</button>
      <button onClick={() => logout()}>TEST_LOGOUT</button>
    </div>
  );
}

test('NavBar dropdown shows Login/Signup when logged out and Dashboard/Logout when logged in', async () => {
  const { container } = render(
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <TestControls />
      </BrowserRouter>
    </AuthProvider>
  );

  // open dropdown (button has class user-btn)
  const userBtn = container.querySelector('.user-btn');
  expect(userBtn).toBeInTheDocument();
  fireEvent.click(userBtn);

  // should show Login and Signup
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Signup')).toBeInTheDocument();

  // perform login via test control
  fireEvent.click(screen.getByText('TEST_LOGIN'));

  // open dropdown again
  fireEvent.click(userBtn);

  // should show Dashboard and Logout
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});
