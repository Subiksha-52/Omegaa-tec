const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
  testOrders();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

async function testOrders() {
  try {
    const Order = require('./models/Order');
    
    // Check if there are any existing orders
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders in database`);
    
    // Check if any orders need the userId field
    const ordersWithoutUserId = orders.filter(order => !order.userId);
    console.log(`Orders without userId: ${ordersWithoutUserId.length}`);
    
    if (ordersWithoutUserId.length > 0) {
      console.log('Some orders need to be updated with userId field');
      // You might want to update these orders with a default userId
      // For example: await Order.updateMany({ userId: { $exists: false } }, { userId: 'default_user_id' });
    }
    
    // Check if any orders need the status field
    const ordersWithoutStatus = orders.filter(order => !order.status);
    console.log(`Orders without status: ${ordersWithoutStatus.length}`);
    
    if (ordersWithoutStatus.length > 0) {
      console.log('Some orders need to be updated with status field');
      // Update orders with default status
      await Order.updateMany({ status: { $exists: false } }, { status: 'pending' });
      console.log('Updated orders with default status: pending');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error testing orders:', error);
    mongoose.connection.close();
  }
}
