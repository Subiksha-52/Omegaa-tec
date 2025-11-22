const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const supplierRoutes = require('./routes/supplier');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const usersRoutes = require('./routes/users');

const app = express();
app.use(express.json());

// -------------------------------------------
// ✅ Configure CORS
// -------------------------------------------
// Configure CORS: allow the configured FRONTEND_URL; if not set,
// fall back to reflecting the request origin (permissive - dev only).
const frontendUrl = process.env.FRONTEND_URL || 'https://omegaa-tec-47ld.vercel.app';
const allowAllWhenNoEnv = !process.env.FRONTEND_URL;

const corsOptions = {
  origin: allowAllWhenNoEnv ? true : [frontendUrl, 'https://omegaa-tec-47ld.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));

// Handle preflight requests using the same options
app.options('*', cors(corsOptions));

// -------------------------------------------
// ✅ Static files (for uploaded images, etc.)
// -------------------------------------------
app.use('/images', express.static('images'));

// -------------------------------------------
// ✅ API Routes
// -------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', usersRoutes);

// -------------------------------------------
// ✅ DB Status Endpoint
// -------------------------------------------
app.get('/api/db-status', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({ connected: isConnected });
});

// -------------------------------------------
// ✅ MongoDB Connection
// -------------------------------------------
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Please set it in backend/.env or Render Environment Variables.');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// -------------------------------------------
// ✅ Default Route
// -------------------------------------------
app.get('/', (req, res) => {
  res.send('✅ API running successfully 🚀');
});

// -------------------------------------------
// ✅ Start Server
// -------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
