const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  notes: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String, required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableNumber: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'Guest Customer' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  serviceCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'], 
    default: 'new' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'mobile_money', 'wallet'], 
    default: 'wallet' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
