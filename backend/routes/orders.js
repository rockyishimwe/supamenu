const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get all orders (Staff/Owner: all, Customer: only their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.userId = req.user.id;
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create/Place an order
router.post('/', authMiddleware, async (req, res) => {
  const { restaurantId, restaurantName, tableId, tableNumber, items, subtotal, tax, serviceCharge, total, paymentMethod } = req.body;
  try {
    const order = new Order({
      restaurantId,
      restaurantName,
      tableId,
      tableNumber,
      userId: req.user.id,
      userName: req.user.name,
      items,
      subtotal,
      tax,
      serviceCharge,
      total,
      status: 'new',
      paymentMethod: paymentMethod || 'wallet'
    });

    await order.save();

    // If order is paid with wallet, deduct balance
    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user.id);
      if (user.walletBalance < total) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      user.walletBalance -= total;
      // Add points
      user.customerDetails.points += Math.floor(total);
      await user.save();
      order.status = 'paid';
      await order.save();
    }

    // If a table is assigned, update its details
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: paymentMethod === 'wallet' ? 'available' : 'occupied',
        currentOrderTotal: paymentMethod === 'wallet' ? 0 : total,
        currentGuestName: paymentMethod === 'wallet' ? '' : req.user.name
      });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

async function updateOrderStatusHandler(req, res) {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // Sync status back to table if needed
    if (order.tableId) {
      if (status === 'paid') {
        await Table.findByIdAndUpdate(order.tableId, {
          status: 'available',
          currentGuestName: '',
          currentGuestsCount: 0,
          currentOrderTotal: 0
        });
      } else if (status === 'preparing') {
        await Table.findByIdAndUpdate(order.tableId, {
          status: 'occupied'
        });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

router.put('/:id/status', authMiddleware, updateOrderStatusHandler);
router.patch('/:id/status', authMiddleware, updateOrderStatusHandler);

module.exports = router;
