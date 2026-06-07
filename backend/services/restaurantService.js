const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

async function getAll() {
  return Restaurant.find();
}

async function getById(id) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw Object.assign(new Error('Restaurant not found'), { status: 404 });
  return restaurant;
}

async function getMenu(restaurantId) {
  return MenuItem.find({ restaurantId });
}

async function updateRestaurant(id, updates, allowedFields) {
  const filtered = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  const restaurant = await Restaurant.findByIdAndUpdate(id, { $set: filtered }, { new: true, runValidators: true });
  if (!restaurant) throw Object.assign(new Error('Restaurant not found'), { status: 404 });
  return restaurant;
}

async function createRestaurant(data) {
  const restaurant = new Restaurant(data);
  await restaurant.save();
  return restaurant;
}

async function addMenuItem(restaurantId, data) {
  const item = new MenuItem({ restaurantId, ...data });
  await item.save();
  return item;
}

module.exports = { getAll, getById, getMenu, updateRestaurant, createRestaurant, addMenuItem };
