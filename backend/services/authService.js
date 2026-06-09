const bcrypt = require('bcryptjs'); // For secure password hashing
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const config = require('../config/env');

const JWT_SECRET = config.JWT_SECRET;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

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

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function registerUser({ name, email, password, role, restaurantCode, restaurantName }) {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('User already exists'), { status: 400 });

  const userData = { name, email, password, role };

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

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken();
  const hashed = hashRefreshToken(refreshToken);
  user.refreshTokens.push({ token: hashed, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000) });
  await user.save();

  return { token: accessToken, refreshToken, user: formatUser(user) };
}

async function loginUser({ email, password, role }) {
  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 400 });
  if (role && user.role !== role) throw Object.assign(new Error('Invalid credentials'), { status: 400 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { status: 400 });

  const token = generateToken(user);
  const refreshToken = generateRefreshToken();
  const hashed = hashRefreshToken(refreshToken);
  user.refreshTokens.push({ token: hashed, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000) });
  // Clean expired tokens on login
  user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
  await user.save();
  return { token, refreshToken, user: formatUser(user) };
}

async function refreshAccessToken(refreshTokenValue) {
  const hashed = hashRefreshToken(refreshTokenValue);
  const user = await User.findOne({ 'refreshTokens.token': hashed });
  if (!user) throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 });

  // Find the matching token entry
  const tokenEntry = user.refreshTokens.find(rt => rt.token === hashed);
  if (!tokenEntry || tokenEntry.expiresAt < new Date()) throw Object.assign(new Error('Refresh token expired'), { status: 401 });

  // Rotate: remove old refresh token, issue new pair
  user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== hashed);
  const newAccessToken = generateToken(user);
  const newRefreshToken = generateRefreshToken();
  const newHashed = hashRefreshToken(newRefreshToken);
  user.refreshTokens.push({ token: newHashed, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000) });
  user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
  await user.save();

  return { token: newAccessToken, refreshToken: newRefreshToken, user: formatUser(user) };
}

async function revokeRefreshToken(refreshTokenValue) {
  const hashed = hashRefreshToken(refreshTokenValue);
  await User.updateOne(
    { 'refreshTokens.token': hashed },
    { $pull: { refreshTokens: { token: hashed } } }
  );
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

module.exports = { registerUser, loginUser, refreshAccessToken, revokeRefreshToken, getProfile, updateProfile, topUpWallet };
