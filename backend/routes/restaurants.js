const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { authMiddleware } = require('../middleware/auth');

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single restaurant detail
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.id || req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get menu items for restaurant
router.get('/:id/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.params.id });
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update restaurant by id (Owner only)
router.patch('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied: Owners only' });
  }

  try {
    const allowed = [
      'name',
      'description',
      'coverImage',
      'logo',
      'cuisines',
      'address',
      'contactNumber',
      'website',
      'openingHours',
      'settings',
      'categories',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create/Update restaurant profile (Owner only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied: Owners only' });
  }

  const { name, description, coverImage, logo, cuisines, address, contactNumber, website, openingHours, settings, categories } = req.body;
  try {
    let restaurant = await Restaurant.findOne(); // For demo/sandbox, we assume single main restaurant
    if (restaurant) {
      // Update
      restaurant.name = name || restaurant.name;
      restaurant.description = description || restaurant.description;
      restaurant.coverImage = coverImage || restaurant.coverImage;
      restaurant.logo = logo || restaurant.logo;
      restaurant.cuisines = cuisines || restaurant.cuisines;
      restaurant.address = address || restaurant.address;
      restaurant.contactNumber = contactNumber || restaurant.contactNumber;
      restaurant.website = website || restaurant.website;
      restaurant.openingHours = openingHours || restaurant.openingHours;
      restaurant.settings = settings || restaurant.settings;
      restaurant.categories = categories || restaurant.categories;
      await restaurant.save();
    } else {
      // Create new
      restaurant = new Restaurant({
        name,
        description,
        coverImage,
        logo,
        cuisines,
        address,
        contactNumber,
        website,
        openingHours,
        settings,
        categories
      });
      await restaurant.save();
    }
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add menu item (Owner only)
router.post('/:id/menu', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied: Owners only' });
  }

  const { name, description, image, price, category, status, stockLevel, tags, ingredients, nutrition } = req.body;
  try {
    const item = new MenuItem({
      restaurantId: req.params.id,
      name,
      description,
      image,
      price,
      category,
      status: status || 'in_stock',
      stockLevel: stockLevel || 100,
      tags: tags || [],
      ingredients: ingredients || [],
      nutrition: nutrition || {}
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
