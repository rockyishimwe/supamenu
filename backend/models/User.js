const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'owner'], default: 'customer' },
  avatar: { type: String, default: '' },
  walletBalance: { type: Number, default: 128.50 },
  refreshTokens: [RefreshTokenSchema],
  customerDetails: {
    points: { type: Number, default: 350 },
    loyaltyTier: { type: String, default: 'Gold Member' }
  },
  staffDetails: {
    role: { type: String, enum: ['Waiter', 'Cashier', 'Kitchen Staff', 'Manager'] },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    restaurantCode: { type: String }
  },
  ownerDetails: {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }
  },
  createdAt: { type: Date, default: Date.now }
});

// Auto-hash password before saving if it has been modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);
