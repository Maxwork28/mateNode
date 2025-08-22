const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const connectDB = require('./config/database');

// Import routes with error handling
let adminRoutes, userRoutes, restaurantRoutes, driverRoutes, adminRestaurantRoutes, adminUserRoutes, adminDriverRoutes, restaurantItemRoutes, restaurantCategoryRoutes, restaurantPlanRoutes, restaurantOfferRoutes, orderRoutes, userPlanRoutes, adminPlanRoutes, adminOfferRoutes, adminItemRoutes, adminCategoryRoutes, adminReviewRoutes, adminOrderRoutes, reviewRoutes;

try {
  adminRoutes = require('./admin/routes/adminRoutes');
  userRoutes = require('./user/routes/userRoutes');
  restaurantRoutes = require('./restaurant/routes/restaurantRoutes');
  driverRoutes = require('./driver/routes/driverRoutes');
  adminRestaurantRoutes = require('./admin/routes/restaurantRoutes');
  adminUserRoutes = require('./admin/routes/userRoutes');
  adminDriverRoutes = require('./admin/routes/driverRoutes');
  restaurantItemRoutes = require('./restaurant/routes/itemRoutes');
  restaurantCategoryRoutes = require('./restaurant/routes/categoryRoutes');
  restaurantPlanRoutes = require('./restaurant/routes/planRoutes');
  restaurantOfferRoutes = require('./restaurant/routes/offerRoutes');
  orderRoutes = require('./order/routes/orderRoutes');
  userPlanRoutes = require('./restaurant/routes/userPlanRoutes');
  reviewRoutes = require('./restaurant/routes/reviewRoutes');
  
  // New admin routes
  adminPlanRoutes = require('./admin/routes/planRoutes');
  adminOfferRoutes = require('./admin/routes/offerRoutes');
  adminItemRoutes = require('./admin/routes/itemRoutes');
  adminCategoryRoutes = require('./admin/routes/categoryRoutes');
  adminReviewRoutes = require('./admin/routes/reviewRoutes');
  adminOrderRoutes = require('./admin/routes/orderRoutes');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  process.exit(1);
}

// Route middleware
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin/restaurants', adminRestaurantRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/drivers', adminDriverRoutes);
app.use('/api/admin/plans', adminPlanRoutes);
app.use('/api/admin/offers', adminOfferRoutes);
app.use('/api/admin/items', adminItemRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/restaurant/items', restaurantItemRoutes);
app.use('/api/restaurant/categories', restaurantCategoryRoutes);
app.use('/api/restaurant/plans', restaurantPlanRoutes);
app.use('/api/restaurant/offers', restaurantOfferRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user/plans', userPlanRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Maate API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Maate API',
    version: '1.0.0',
    endpoints: {
      admin: '/api/admin',
      user: '/api/user',
      restaurant: '/api/restaurant',
      driver: '/api/driver',
      orders: '/api/orders',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();
