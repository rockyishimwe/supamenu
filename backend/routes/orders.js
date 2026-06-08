const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const orderService = require('../services/orderService');

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders (scoped by role)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await orderService.getOrders(req.user.id, req.user.role, req.query);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, total]
 *             properties:
 *               restaurantId: { type: string }
 *               restaurantName: { type: string }
 *               tableId: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId: { type: string }
 *                     name: { type: string }
 *                     quantity: { type: integer }
 *                     price: { type: number }
 *               total: { type: number }
 *               paymentMethod: { type: string, enum: [wallet, card, mobile_money] }
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
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

/**
 * @openapi
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [new, preparing, ready, served, paid, cancelled] }
 *     responses:
 *       200:
 *         description: Order status updated
 */
async function updateOrderStatusHandler(req, res) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

const orderStatusChain = [
  authMiddleware,
  body('status').isIn(['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'])
    .withMessage('Invalid order status'),
  validate,
];

router.put('/:id/status', ...orderStatusChain, updateOrderStatusHandler);
router.patch('/:id/status', ...orderStatusChain, updateOrderStatusHandler);

module.exports = router;
