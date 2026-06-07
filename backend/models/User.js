const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'owner'], default: 'customer' },
  avatar: { type: String, default: '' },
  walletBalance: { type: Number, default: 128.50 },
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

module.exports = mongoose.model('User', UserSchema);
