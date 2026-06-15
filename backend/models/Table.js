const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: Number, required: true },
  capacity: { type: Number, required: true },
  location: { type: String, default: 'Main Floor' }, // Main Floor, Terrace, etc.
  x: { type: Number, required: true }, // X coordinate on layout grid (0-100)
  y: { type: Number, required: true }, // Y coordinate on layout grid (0-100)
  width: { type: Number, default: 80 }, // visual styling width
  height: { type: Number, default: 80 }, // visual styling height
  shape: { type: String, enum: ['round', 'square', 'rectangle'], default: 'square' },
  status: { type: String, enum: ['available', 'reserved', 'occupied', 'cleaning'], default: 'available' },
  currentDuration: { type: Number, default: 0 }, // in minutes
  currentGuestName: { type: String, default: '' },
  currentGuestsCount: { type: Number, default: 0 },
  currentOrderTotal: { type: Number, default: 0 },
  assignedServer: { type: String, default: '' }
});

module.exports = mongoose.model('Table', TableSchema);
