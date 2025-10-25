import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://omegaa-tec-1.onrender.com',
  timeout: 10000,
});

// attach a request interceptor for future extension
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API Interceptor running for:', config.url);
    
    // Ensure Authorization header is present when token or adminToken exists in localStorage.
    try {
      if (!config.headers) config.headers = {};
      
      // Check if Authorization header is already set
      if (config.headers.Authorization) {
        console.log('✅ API: Authorization header already set');
        return config;
      }
      
      // Prioritize adminToken over regular token
      const adminToken = localStorage.getItem('adminToken');
      const token = localStorage.getItem('token');
      
      console.log('🔐 API: Tokens in localStorage -', {
        hasAdminToken: !!adminToken,
        hasUserToken: !!token
      });
      
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.log('✅ API: Using adminToken for request');
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ API: Using user token for request');
      } else {
        console.warn('⚠️ API: No token available for request to', config.url);
      }
    } catch (e) {
      // ignore localStorage errors
      console.error('❌ API: Error accessing localStorage', e);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Global response handler: detect 401 and malformed tokens
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 401) {
        // If backend indicates malformed token, clear adminToken/local token
        if (data && data.error === 'AUTH_TOKEN_MALFORMED') {
          console.warn('API: Malformed auth token detected; clearing stored tokens');
          try { localStorage.removeItem('token'); } catch {}
          try { localStorage.removeItem('adminToken'); } catch {}
        }
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(err);
  }
);

export default api;
