const Order = require('../models/Order');
const Table = require('../models/Table');
const User = require('../models/User');

async function getOrders(userId, role, query = {}) {
  const filter = { ...query };
  if (role === 'customer') {
    filter.userId = userId;
  }
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function createOrder(userId, { restaurantId, restaurantName, tableId, tableNumber, items, total, paymentMethod = 'wallet' }) {
  if (paymentMethod === 'wallet') {
    const user = await User.findById(userId);
    if (!user || user.walletBalance < total) {
      throw Object.assign(new Error('Insufficient wallet balance'), { status: 400 });
    }
    user.walletBalance -= total;
    user.customerDetails.points = (user.customerDetails.points || 0) + Math.floor(total);
    await user.save();
  }

  const order = new Order({
    restaurantId,
    restaurantName,
    tableId,
    tableNumber,
    userId,
    userName: 'Customer',
    items,
    subtotal: total / 1.185,
    tax: total * 0.085,
    serviceCharge: total * 0.1,
    total,
    status: paymentMethod === 'wallet' ? 'preparing' : 'new',
    paymentMethod,
  });

  await order.save();

  if (tableId) {
    await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
  }

  return order;
}

async function updateOrderStatus(orderId, status) {
  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  return order;
}

module.exports = { getOrders, createOrder, updateOrderStatus };
