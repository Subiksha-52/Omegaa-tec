import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Auth.css';

const Activate = () => {
  const { token } = useParams();
  const [msg, setMsg] = useState('Activating...');

  useEffect(() => {
  fetch(`https://omegaa-tec-1.onrender.com/api/auth/activate/${token}`)
      .then(res => res.json())
      .then(data => setMsg(data.msg));
  }, [token]);

  return (
    <div className="auth-container">
      <h2>Account Activation</h2>
      <div className="auth-msg">{msg}</div>
      <div className="auth-link"><a href="/login">Go to Login</a></div>
    </div>
  );
};

export default Activate;
