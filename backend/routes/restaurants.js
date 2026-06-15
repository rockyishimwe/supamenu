const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sanitize } = require('../utils/sanitize');
const restaurantService = require('../services/restaurantService');

const ALLOWED_UPDATE_FIELDS = [
  'name', 'description', 'coverImage', 'logo', 'cuisines', 'address',
  'contactNumber', 'website', 'openingHours', 'settings', 'categories',
];

// Get all restaurants (public)
router.get('/', async (req, res, next) => {
  try {
    const restaurants = await restaurantService.getAll();
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

// Get single restaurant detail (public)
router.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await restaurantService.getById(req.params.id);
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});

// Get menu items for restaurant (public)
router.get('/:id/menu', async (req, res, next) => {
  try {
    const menu = await restaurantService.getMenu(req.params.id);
    res.json(menu);
  } catch (err) {
    next(err);
  }
});

// Update restaurant by id (Owner only)
router.patch('/:id',
  authMiddleware,
  requireRole('owner'),
  body('name').optional().trim().notEmpty().withMessage('Restaurant name cannot be empty'),
  body('cuisines').optional().isArray().withMessage('Cuisines must be an array'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  validate,
  async (req, res, next) => {
  try {
    req.body = sanitize(req.body, ['name', 'description', 'address']);
    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body, ALLOWED_UPDATE_FIELDS);
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});

// Create/Update restaurant profile (Owner only)
router.post('/',
  authMiddleware,
  requireRole('owner'),
  body('name').optional().trim().notEmpty().withMessage('Restaurant name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('cuisines').optional().isArray().withMessage('Cuisines must be an array'),
  validate,
  async (req, res, next) => {
  try {
    let restaurant = await restaurantService.getById(req.params.id).catch(() => null);
    if (restaurant) {
      req.body = sanitize(req.body, ['name', 'description', 'address']);
      restaurant = await restaurantService.updateRestaurant(restaurant._id, req.body, ALLOWED_UPDATE_FIELDS);
    } else {
      restaurant = await restaurantService.createRestaurant(req.body);
    }
    res.status(200).json(restaurant);
  } catch (err) {
    next(err);
  }
});

// Add menu item (Owner only)
router.post('/:id/menu',
  authMiddleware,
  requireRole('owner'),
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').optional().trim(),
  validate,
  async (req, res, next) => {
  try {
    const item = await restaurantService.addMenuItem(req.params.id, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
