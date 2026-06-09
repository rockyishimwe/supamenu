const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authMiddleware);
router.use(requireRole('owner'));

// Get staff for the restaurant
router.get('/', async (req, res, next) => {
  const restaurantId = req.user.ownerDetails?.restaurantId;
  if (!restaurantId) return res.status(400).json({ message: 'No restaurant assigned' });
  try {
    const staff = await User.find({ 'staffDetails.restaurantId': restaurantId, role: 'staff' }).select('-password');
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
  validate,
  async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const restaurantId = req.user.ownerDetails?.restaurantId;
    if (!restaurantId) return res.status(400).json({ message: 'No restaurant assigned' });

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        const restaurantCode = restaurant?.inviteCode || '';
        const newUser = new User({
            name, email, password, role: 'staff',
            staffDetails: { role, restaurantId, restaurantCode }
        });
        await newUser.save();
        const userData = newUser.toObject();
        delete userData.password;
        res.status(201).json(userData);
    } catch(e) {
        next(e);
    }
});

// Remove staff
router.delete('/:id', async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff deleted' });
    } catch(e) {
        next(e);
    }
});

module.exports = router;
