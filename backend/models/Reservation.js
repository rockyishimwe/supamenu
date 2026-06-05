const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableNumber: { type: Number },
  guestsCount: { type: Number, required: true },
  reservationDate: { type: String, required: true }, // Format: YYYY-MM-DD
  reservationTime: { type: String, required: true }, // Format: HH:MM or 12h representation
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
