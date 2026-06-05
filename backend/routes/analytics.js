const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

function last30DaysSales() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const base = 800 + Math.sin(i / 3) * 400 + (29 - i) * 15;
    data.push({ date: label, sales: Math.round(base), revenue: Math.round(base * 0.75) });
  }
  return data;
}

function coversByDayOfWeek() {
  return [
    { day: 'Mon', covers: 42 },
    { day: 'Tue', covers: 38 },
    { day: 'Wed', covers: 55 },
    { day: 'Thu', covers: 61 },
    { day: 'Fri', covers: 88 },
    { day: 'Sat', covers: 102 },
    { day: 'Sun', covers: 76 },
  ];
}

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments();
    const reservationsCount = await Reservation.countDocuments();
    const customersCount = await User.countDocuments({ role: 'customer' });
    const paidOrders = await Order.find({ status: 'paid' });
    const liveRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      revenue: parseFloat((12650 + liveRevenue).toFixed(2)),
      orders: 128 + ordersCount,
      reservations: 32 + reservationsCount,
      customers: 240 + customersCount,
      activeTables: 24,
      pendingOrders: await Order.countDocuments({ status: { $in: ['new', 'preparing'] } }),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/sales-chart', authMiddleware, async (req, res) => {
  try {
    res.json(last30DaysSales());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/reservations-chart', authMiddleware, async (req, res) => {
  try {
    res.json(coversByDayOfWeek());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/owner-dashboard', authMiddleware, async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments();
    const reservationsCount = await Reservation.countDocuments();
    const customersCount = await User.countDocuments({ role: 'customer' });
    const staffCount = await User.countDocuments({ role: 'staff' });
    const paidOrders = await Order.find({ status: 'paid' });
    const liveRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      kpis: {
        revenue: parseFloat((12650 + liveRevenue).toFixed(2)),
        orders: 128 + ordersCount,
        reservations: 32 + reservationsCount,
        customers: 240 + customersCount,
        staff: 12 + staffCount,
      },
      salesChartData: last30DaysSales(),
      monthlyRevenueData: coversByDayOfWeek().map((d) => ({ month: d.day, revenue: d.covers * 120 })),
      topSellingItems: [
        { name: 'Truffle Mushroom Pasta', sales: 145, revenue: 3623.55 },
        { name: 'Margherita Pizza', sales: 120, revenue: 2278.8 },
        { name: 'Dragon Roll', sales: 98, revenue: 1665.02 },
        { name: 'Classic Tiramisu', sales: 88, revenue: 879.12 },
      ],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
