# TODO: Fix Frontend-Backend Integration Issues

## Issues Identified:
1. **CORS Configuration**: Backend CORS origin uses `process.env.FRONTEND_URL`, but this may not be set in Render environment variables.
2. **Hardcoded localhost URLs**: Multiple files still use `http://localhost:5000` instead of the deployed backend URL.
3. **Image URLs**: Product images are using localhost URLs in production.

## Tasks:
- [ ] Update backend CORS to allow the Vercel frontend URL
- [ ] Replace hardcoded localhost URLs in frontend files with dynamic API base URL
- [ ] Update image source URLs to use the correct backend URL
- [ ] Set environment variables in Render and Vercel if needed
- [ ] Test the fixes

## Files to Update:
- backend/server.js (CORS)
- ecom-frontend/src/pages/Register.js
- ecom-frontend/src/pages/Login.js
- ecom-frontend/src/pages/ResetPassword.js
- ecom-frontend/src/pages/Activate.js
- ecom-frontend/src/pages/AdminLogin.js
- ecom-frontend/src/pages/ProductAdmin.js
- ecom-frontend/src/pages/Checkout.js
- ecom-frontend/src/pages/CartPage.js
- ecom-frontend/src/components/CartSidebar.js
- ecom-frontend/src/pages/ProductList.js (image URLs)
