import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AdminLogin = () => {
	const [passkey, setPasskey] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	// Read admin passkey from environment for security in production builds.
	// Fallback to a local dev passkey only if the env var is not set.
	const ADMIN_PASSKEY = process.env.REACT_APP_ADMIN_PASSKEY || 'admin123';

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		if (!passkey) {
			setError('Please enter the admin passkey');
			return;
		}

		if (passkey === ADMIN_PASSKEY) {
			// mark local session for admin (simple client-side guard)
			try {
				// store a simple token flag; replace with real auth in production
				localStorage.setItem('adminToken', Date.now().toString());
				localStorage.setItem('isAdmin', 'true');
			} catch (err) {}
			navigate('/admin/dashboard');
		} else {
			setError('Invalid passkey');
		}
	};

	return (
		<div className="bg-image-page">
			<div className="auth-container">
				<h2>Admin Login</h2>
				<form className="auth-form" onSubmit={handleSubmit}>
					<div className="form-group">
						<input
							name="adminPasskey"
							type="password"
							placeholder="Enter admin passkey"
							value={passkey}
							onChange={e => setPasskey(e.target.value)}
							autoFocus
						/>
					</div>

					{process.env.REACT_APP_ADMIN_PASSKEY ? null : (
						<div style={{ color: '#a05600', fontSize: '0.9rem', textAlign: 'center' }}>
							Notice: No `REACT_APP_ADMIN_PASSKEY` set. Using local default for development.
						</div>
					)}

					{error && <div className={`auth-msg ${error ? '' : 'success'}`}>{error}</div>}

					<button type="submit">Enter Admin</button>
				</form>
			</div>
		</div>
	);
};

export default AdminLogin;
