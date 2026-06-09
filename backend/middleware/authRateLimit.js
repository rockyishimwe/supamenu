const rateLimit = require('express-rate-limit');

// Skip rate limiting in test mode so integration tests work without hitting limits
const isTest = process.env.NODE_ENV === 'test';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 0 : 5, // 0 = disabled in test mode
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

module.exports = authRateLimiter;
