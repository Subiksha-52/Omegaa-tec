const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./backend/models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connect to MongoDB (require MONGO_URI environment variable)
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not set. Please set it in backend/.env to your MongoDB Atlas connection string.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    let testUser = await User.findOne({ email: 'admin@test.com' });

    if (testUser) {
      console.log('✅ Test user already exists');
      // Generate token for existing user
      const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
      console.log('🔑 Token for existing user:', token);
      return token;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: hashedPassword,
      isVerified: true,
      role: 'admin'
    });

    await testUser.save();
    console.log('✅ Test user created');

    // Generate token
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
    console.log('🔑 Token for new user:', token);

    return token;

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUser();
