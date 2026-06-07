const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authMiddleware);

// Get staff for the restaurant
router.get('/', async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  const restaurantId = req.user.ownerDetails?.restaurantId;
  if (!restaurantId) return res.status(400).json({ message: 'No restaurant assigned' });
  try {
    const staff = await User.find({ 'staffDetails.restaurantId': restaurantId, role: 'staff' }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add staff
router.post('/',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate,
  async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
    const { name, email, password, role } = req.body;
    const restaurantId = req.user.ownerDetails?.restaurantId;
    if (!restaurantId) return res.status(400).json({ message: 'No restaurant assigned' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'changeme123', salt);

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        const restaurantCode = restaurant?.inviteCode || '';
        const newUser = new User({
            name, email, password: hashedPassword, role: 'staff',
            staffDetails: { role, restaurantId, restaurantCode }
        });
        await newUser.save();
        const userData = newUser.toObject();
        delete userData.password;
        res.status(201).json(userData);
    } catch(e) {
        res.status(500).json({ message: 'Error adding staff' });
    }
});

// Remove staff
router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff deleted' });
    } catch(e) {
        res.status(500).json({ message: 'Error deleting staff' });
    }
});

module.exports = router;
