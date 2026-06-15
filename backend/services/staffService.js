const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

async function getStaffByRestaurant(restaurantId) {
  if (!restaurantId) {
    const err = new Error('No restaurant assigned');
    err.status = 400;
    throw err;
  }
  return User.find({ 'staffDetails.restaurantId': restaurantId, role: 'staff' }).select('-password');
}

async function addStaff(data) {
  const restaurant = await Restaurant.findById(data.restaurantId);
  const restaurantCode = restaurant?.inviteCode || '';

  const newUser = new User({
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'staff',
    staffDetails: { role: data.staffRole, restaurantId: data.restaurantId, restaurantCode },
  });
  await newUser.save();

  const userData = newUser.toObject();
  delete userData.password;
  return userData;
}

async function removeStaff(id) {
  await User.findByIdAndDelete(id);
  return { message: 'Staff deleted' };
}

module.exports = { getStaffByRestaurant, addStaff, removeStaff };
