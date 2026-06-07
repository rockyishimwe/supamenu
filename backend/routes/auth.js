const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const authService = require('../services/authService');

// Register
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['customer', 'staff', 'owner']).withMessage('Role must be customer, staff, or owner'),
  validate,
  async (req, res) => {
    try {
      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }
);

// Login
router.post('/login',
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res) => {
    try {
      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Update profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await authService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Update Wallet Balance
router.post('/wallet/topup',
  authMiddleware,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  validate,
  async (req, res) => {
    try {
      const result = await authService.topUpWallet(req.user.id, req.body.amount);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }
);

module.exports = router;
module.exports.authMiddleware = authMiddleware;
