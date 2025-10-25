const axios = require('axios');

async function testEndpoints() {
  const baseURL = 'http://localhost:5000';

  console.log('Testing API endpoints...');

  try {
    // Test if server is running
    const healthCheck = await axios.get(`${baseURL}/`);
    console.log('✅ Server is running:', healthCheck.data);
  } catch (error) {
    console.log('❌ Server not running or health check failed');
    return;
  }
  
  try {
    // Test auth endpoint
    const authTest = await axios.get(`${baseURL}/auth/me`);
    console.log('✅ Auth endpoint accessible');
  } catch (error) {
    console.log('❌ Auth endpoint failed:', error.response?.data || error.message);
  }
  
  try {
    // Test orders endpoint without auth
    const ordersTest = await axios.get(`${baseURL}/orders/user?userId=test`);
    console.log('✅ Orders endpoint accessible');
  } catch (error) {
    console.log('❌ Orders endpoint failed (expected without auth):', error.response?.status, error.response?.data?.error || error.message);
  }
  
  console.log('API endpoint test completed');
}

testEndpoints().catch(console.error);
