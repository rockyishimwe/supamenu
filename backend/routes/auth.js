const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sanitize } = require('../utils/sanitize');
const authService = require('../services/authService');

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [customer, staff, owner] }
 *               restaurantCode: { type: string, description: Required if role=staff }
 *               restaurantName: { type: string, description: Optional for owner }
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register',
  // Name: at least 2 chars, must contain at least one letter
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .matches(/[a-zA-Z]/).withMessage('Name must contain at least one letter'),
  // Email: valid format with domain TLD validation
  body('email')
    .isEmail({ domain_specific_validation: true }).withMessage('Must be a valid email address (e.g. user@domain.com)')
    .normalizeEmail(),
  // Password: min 8 chars, mixed case + digit
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a digit'),
  body('role').isIn(['customer', 'staff', 'owner']).withMessage('Role must be customer, staff, or owner'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               role: { type: string, enum: [customer, staff, owner] }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Invalid credentials
 */
router.post('/login',
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/profile:
 *   patch:
 *     tags: [Auth]
 *     summary: Update user profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               avatar: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    req.body = sanitize(req.body, ['name', 'avatar']);
    const profile = await authService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/wallet/topup:
 *   post:
 *     tags: [Auth]
 *     summary: Top up wallet balance
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, minimum: 0.01 }
 *     responses:
 *       200:
 *         description: Wallet topped up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 walletBalance: { type: number }
 */
router.post('/wallet/topup',
  authMiddleware,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.topUpWallet(req.user.id, req.body.amount);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────
// Refresh token rotation
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access + refresh pair (rotation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 refreshToken: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token',
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the refresh token (logout)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout',
  authMiddleware,
  body('refreshToken').optional().notEmpty(),
  async (req, res, next) => {
    try {
      if (req.body.refreshToken) {
        await authService.revokeRefreshToken(req.body.refreshToken);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
module.exports.authMiddleware = authMiddleware;
