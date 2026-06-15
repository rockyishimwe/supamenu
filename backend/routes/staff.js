const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const staffService = require('../services/staffService');

router.use(authMiddleware);
router.use(requireRole('owner'));

// Get staff for the restaurant
router.get('/', async (req, res, next) => {
  try {
    const restaurantId = req.user.ownerDetails?.restaurantId;
    if (!restaurantId) return res.status(400).json({ message: 'No restaurant assigned' });
    const staff = await staffService.getStaffByRestaurant(restaurantId);
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

// Add staff
router.post('/',
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .matches(/[a-zA-Z]/).withMessage('Name must contain at least one letter'),
  body('email')
    .isEmail({ domain_specific_validation: true }).withMessage('Must be a valid email address (e.g. user@domain.com)')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a digit'),
  body('role').isIn(['Waiter', 'Cashier', 'Kitchen Staff', 'Manager'])
    .withMessage('Staff role must be Waiter, Cashier, Kitchen Staff, or Manager'),
  validate,
  async (req, res, next) => {
    try {
      const restaurantId = req.user.ownerDetails?.restaurantId;
      if (!restaurantId) return res.status(400).json({ message: 'No restaurant assigned' });

      const userData = await staffService.addStaff({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        staffRole: req.body.role,
        restaurantId,
      });
      res.status(201).json(userData);
    } catch (err) {
      next(err);
    }
  }
);

// Remove staff
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await staffService.removeStaff(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
