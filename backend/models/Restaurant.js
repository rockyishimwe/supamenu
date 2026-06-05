const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  logo: { type: String, default: '' },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  cuisines: [{ type: String }],
  address: { type: String, required: true },
  contactNumber: { type: String, default: '' },
  website: { type: String, default: '' },
  openingHours: { type: String, default: '10:00 AM - 11:00 PM' },
  settings: {
    taxes: { type: Number, default: 8.5 }, // percentage
    serviceCharges: { type: Number, default: 10.0 } // percentage
  },
  categories: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
