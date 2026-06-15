const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Return a Date representing `daysAgo` days before today at 00:00:00 UTC.
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(0, 0, 0);
  return d;
}

/**
 * Format a date as short string, e.g. "Jun 14".
 */
function formatShortDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Routes ──────────────────────────────────────────────────────────

/**
 * GET /api/analytics/summary
 * Returns high-level KPIs from real DB counts.
 */
router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const [ordersCount, reservationsCount, customersCount, paidOrders, activeTables, pendingOrders] =
      await Promise.all([
        Order.countDocuments(),
        Reservation.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Order.find({ status: 'paid' }).lean(),
        require('../models/Table').countDocuments({ status: 'occupied' }),
        Order.countDocuments({ status: { $in: ['new', 'preparing'] } }),
      ]);

    const liveRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
      revenue: parseFloat(liveRevenue.toFixed(2)),
      orders: ordersCount,
      reservations: reservationsCount,
      customers: customersCount,
      activeTables,
      pendingOrders,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/sales-chart
 * Returns per-day sales count and revenue for the last 30 days.
 */
router.get('/sales-chart', authMiddleware, async (req, res, next) => {
  try {
    const thirtyDaysAgo = daysAgo(30);
    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).lean();

    // Build a lookup for every day in the range
    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { date: formatShortDate(d), sales: 0, revenue: 0 };
    }

    for (const order of orders) {
      const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].sales += 1;
        dailyMap[dateKey].revenue += order.total || 0;
      }
    }

    res.json(Object.values(dailyMap));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/reservations-chart
 * Returns covers (guest count) grouped by day of week for the last 30 days.
 */
router.get('/reservations-chart', authMiddleware, async (req, res, next) => {
  try {
    const thirtyDaysAgo = daysAgo(30);
    const reservations = await Reservation.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).lean();

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const coversByDay = dayNames.map((day) => ({ day, covers: 0 }));

    for (const r of reservations) {
      const dayIndex = new Date(r.createdAt).getDay();
      coversByDay[dayIndex].covers += r.guestsCount || 1;
    }

    res.json(coversByDay);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/owner-dashboard
 * Aggregated dashboard data for the owner portal — KPIs, sales chart,
 * monthly revenue, and top-selling items.
 */
router.get('/owner-dashboard', authMiddleware, async (req, res, next) => {
  try {
    const thirtyDaysAgo = daysAgo(30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      ordersCount,
      reservationsCount,
      customersCount,
      staffCount,
      paidOrders,
      salesOrders,
      monthlyRevenueAgg,
      topItemsAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Reservation.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'staff' }),
      Order.find({ status: 'paid' }).lean(),
      Order.find({ createdAt: { $gte: thirtyDaysAgo } }).lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            name: '$_id',
            sales: 1,
            revenue: { $round: ['$revenue', 2] },
          },
        },
      ]),
    ]);

    const liveRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Build sales chart from the fetched sales orders
    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { date: formatShortDate(d), sales: 0, revenue: 0 };
    }
    for (const order of salesOrders) {
      const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].sales += 1;
        dailyMap[dateKey].revenue += order.total || 0;
      }
    }

    res.json({
      kpis: {
        revenue: parseFloat(liveRevenue.toFixed(2)),
        orders: ordersCount,
        reservations: reservationsCount,
        customers: customersCount,
        staff: staffCount,
      },
      salesChartData: Object.values(dailyMap),
      monthlyRevenueData: monthlyRevenueAgg.map((d) => ({
        month: new Date(d._id.year, d._id.month - 1).toLocaleString('en-US', { month: 'short' }),
        revenue: parseFloat(d.revenue.toFixed(2)),
      })),
      topSellingItems: topItemsAgg,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
