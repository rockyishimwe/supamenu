const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const JWT_SECRET = config.JWT_SECRET;

// Simple in-memory cache to reduce DB lookups on every request
const userCache = new Map();
const CACHE_TTL_MS = 60_000; // 1 minute

async function getCachedUser(userId) {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  const user = await User.findById(userId).select('-password');
  if (user) {
    userCache.set(userId, { data: user, timestamp: Date.now() });
  }
  return user;
}

async function authMiddleware(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getCachedUser(decoded.id);
    if (!user) return res.status(401).json({ message: 'Token is not valid' });

    // Check if password was changed after this token was issued
    if (user.passwordChangedAt) {
      const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedAt) {
        return res.status(401).json({ message: 'Token expired due to password change. Please log in again.' });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, JWT_SECRET };
