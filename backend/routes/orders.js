const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const orderService = require('../services/orderService');

// Get all orders (Staff/Owner: all, Customer: only their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await orderService.getOrders(req.user.id, req.user.role, req.query);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Create/Place an order
router.post('/',
  authMiddleware,
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('total').isFloat({ min: 0.01 }).withMessage('Total must be a positive number'),
  body('paymentMethod').optional().isIn(['wallet', 'card', 'mobile_money']).withMessage('Invalid payment method'),
  validate,
  async (req, res) => {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      res.status(201).json(order);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }
);

// Update order status
async function updateOrderStatusHandler(req, res) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

router.put('/:id/status', authMiddleware, updateOrderStatusHandler);
router.patch('/:id/status', authMiddleware, updateOrderStatusHandler);

module.exports = router;
