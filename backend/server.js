// backend/server.js

const express = require('express');
const config = require('./config/env'); // Validates required env vars on import
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const csrfProtection = require('./middleware/csrf');
const globalRateLimiter = require('./middleware/rateLimit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const restaurantRoutes = require('./routes/restaurants');
const tableRoutes = require('./routes/tables');
const reservationRoutes = require('./routes/reservations');
const staffRoutes = require('./routes/staff');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware
app.use(express.json());
app.use(globalRateLimiter);
app.use(csrfProtection);

// API Documentation
app.use('/api-docs', (req, res, next) => {
  // Override the default strict CSP to allow Chrome DevTools connections
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:5000;"
  );
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'DineFlow API Docs',
  swaggerOptions: {
    requestInterceptor: (req) => {
      req.credentials = 'omit';
      return req;
    },
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
});
