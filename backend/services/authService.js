const bcrypt = require('bcryptjs'); // For secure password hashing
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '7d';

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    walletBalance: user.walletBalance,
    avatar: user.avatar,
    customerDetails: user.customerDetails,
    staffDetails: user.staffDetails,
    ownerDetails: user.ownerDetails,
  };
}

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function registerUser({ name, email, password, role, restaurantCode, restaurantName }) {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('User already exists'), { status: 400 });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userData = { name, email, password: hashedPassword, role };

  if (role === 'staff') {
    const restaurant = await Restaurant.findOne({ inviteCode: restaurantCode });
    if (!restaurant) throw Object.assign(new Error('Invalid invite code'), { status: 400 });
    userData.staffDetails = { restaurantId: restaurant._id, restaurantCode };
  } else if (role === 'owner') {
    const restaurant = new Restaurant({
      name: restaurantName || `${name}'s Restaurant`,
      address: 'TBD',
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
    await restaurant.save();
    userData.ownerDetails = { restaurantId: restaurant._id };
  } else {
    userData.walletBalance = 128.50;
    userData.customerDetails = { points: 350, loyaltyTier: 'Gold Member' };
  }

  const user = new User(userData);
  await user.save();

  if (role === 'owner') {
    await Restaurant.findByIdAndUpdate(user.ownerDetails.restaurantId, { owner: user._id });
  }

  const token = generateToken(user);
  return { token, user: formatUser(user) };
}

async function loginUser({ email, password, role }) {
  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 400 });
  if (role && user.role !== role) throw Object.assign(new Error('Invalid credentials'), { status: 400 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { status: 400 });

  const token = generateToken(user);
  return { token, user: formatUser(user) };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return formatUser(user);
}

async function updateProfile(userId, { name, email, avatar }) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  if (name) user.name = name;
  if (email) user.email = email;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  return formatUser(user);
}

async function topUpWallet(userId, amount) {
  const amt = parseFloat(amount);
  if (!amt || amt <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });

  const user = await User.findById(userId);
  user.walletBalance += amt;
  await user.save();
  return { walletBalance: user.walletBalance };
}

module.exports = { registerUser, loginUser, getProfile, updateProfile, topUpWallet };
