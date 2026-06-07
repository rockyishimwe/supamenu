const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const restaurantService = require('../services/restaurantService');

const ALLOWED_UPDATE_FIELDS = [
  'name', 'description', 'coverImage', 'logo', 'cuisines', 'address',
  'contactNumber', 'website', 'openingHours', 'settings', 'categories',
];

// Get all restaurants (public)
router.get('/', async (req, res) => {
  try {
    const restaurants = await restaurantService.getAll();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single restaurant detail (public)
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await restaurantService.getById(req.params.id);
    res.json(restaurant);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Get menu items for restaurant (public)
router.get('/:id/menu', async (req, res) => {
  try {
    const menu = await restaurantService.getMenu(req.params.id);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update restaurant by id (Owner only)
router.patch('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  try {
    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body, ALLOWED_UPDATE_FIELDS);
    res.json(restaurant);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Create/Update restaurant profile (Owner only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  try {
    let restaurant = await restaurantService.getById(req.params.id).catch(() => null);
    if (restaurant) {
      restaurant = await restaurantService.updateRestaurant(restaurant._id, req.body, ALLOWED_UPDATE_FIELDS);
    } else {
      restaurant = await restaurantService.createRestaurant(req.body);
    }
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Add menu item (Owner only)
router.post('/:id/menu', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  try {
    const item = await restaurantService.addMenuItem(req.params.id, req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
