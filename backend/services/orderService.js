const Order = require('../models/Order');
const Table = require('../models/Table');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Default rates used when restaurant settings are not available
const DEFAULT_TAX_RATE = 8.5;        // percent — matches Restaurant.settings.taxes default
const DEFAULT_SERVICE_CHARGE = 10.0; // percent — matches Restaurant.settings.serviceCharges default

/**
 * Fetch effective tax and service-charge rates for a restaurant.
 * Falls back to defaults if the restaurant isn't found or has no custom settings.
 */
async function getEffectiveRates(restaurantId) {
  if (!restaurantId) {
    return { taxRate: DEFAULT_TAX_RATE, serviceChargeRate: DEFAULT_SERVICE_CHARGE };
  }
  try {
    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (restaurant && restaurant.settings) {
      return {
        taxRate: restaurant.settings.taxes ?? DEFAULT_TAX_RATE,
        serviceChargeRate: restaurant.settings.serviceCharges ?? DEFAULT_SERVICE_CHARGE,
      };
    }
  } catch {
    // Fall through to defaults
  }
  return { taxRate: DEFAULT_TAX_RATE, serviceChargeRate: DEFAULT_SERVICE_CHARGE };
}

/**
 * Calculate subtotal, tax, and service charge from total + rates.
 * total = subtotal + tax + serviceCharge
 *         = subtotal * (1 + taxRate/100 + serviceChargeRate/100)
 * subtotal = total / (1 + taxRate/100 + serviceChargeRate/100)
 */
function calculateCharges(total, taxRate, serviceChargeRate) {
  const factor = 1 + taxRate / 100 + serviceChargeRate / 100;
  const subtotal = parseFloat((total / factor).toFixed(2));
  const tax = parseFloat((subtotal * taxRate / 100).toFixed(2));
  const serviceCharge = parseFloat((subtotal * serviceChargeRate / 100).toFixed(2));
  return { subtotal, tax, serviceCharge };
}

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

  const { taxRate, serviceChargeRate } = await getEffectiveRates(restaurantId);
  const { subtotal, tax, serviceCharge } = calculateCharges(total, taxRate, serviceChargeRate);

  const order = new Order({
    restaurantId,
    restaurantName,
    tableId,
    tableNumber,
    userId,
    userName: 'Customer',
    items,
    subtotal,
    tax,
    serviceCharge,
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
