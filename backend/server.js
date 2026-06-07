const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const seedDatabase = require('./seed');
const errorHandler = require('./middleware/errorHandler');
const ensureIndexes = require('./seed/indexes');
const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();
const validateEnv = require('./config/env');
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' })); // limit payload size

// HTTP request logging
app.use(morgan('dev'));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, try again later.' },
});
app.use(globalLimiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, try again later.' },
});
app.use('/api/auth', authLimiter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dineflow';

mongoose.connect(MONGO_URI)
  .then(async () => {
    logger.info('MongoDB connected successfully');
    try {
      const result = await seedDatabase();
      if (!result.skipped) logger.info('Auto-seed completed on empty database');
      await ensureIndexes();
    } catch (err) {
      logger.error('Auto-seed failed:', err.message);
    }

    app.listen(PORT, () => {
      logger.info(`DineFlow Express server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed:', err.message);
  });

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/staff', require('./routes/staff'));

app.use(errorHandler);
