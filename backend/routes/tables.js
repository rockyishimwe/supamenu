const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const tableService = require('../services/tableService');

// Get all tables for a restaurant
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    let restaurantId = req.query.restaurantId;

    if (user.role === 'customer') {
      if (!restaurantId) return res.status(400).json({ message: 'restaurantId required' });
    } else {
      restaurantId = user.staffDetails?.restaurantId || user.ownerDetails?.restaurantId;
      if (!restaurantId) return res.status(403).json({ message: 'No restaurant assigned' });
    }

    const tables = await tableService.getTables({ restaurantId });
    res.json(tables);
  } catch (err) {
    next(err);
  }
});

// Create a table (Owner/Staff)
router.post('/',
  authMiddleware,
  requireRole('owner', 'staff'),
  body('restaurantId').notEmpty().withMessage('restaurantId is required'),
  body('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a positive integer'),
  body('capacity').isInt({ min: 1 }).withMessage('capacity must be at least 1'),
  validate,
  async (req, res, next) => {
    try {
      const table = await tableService.createTable(req.body);
      res.status(201).json(table);
    } catch (err) {
      next(err);
    }
  }
);

// Update a table
router.put('/:id',
  authMiddleware,
  body('status').optional().isIn(['available', 'occupied', 'reserved', 'maintenance']).withMessage('Invalid table status'),
  body('currentDuration').optional().isInt({ min: 0 }).withMessage('Invalid duration'),
  body('currentGuestsCount').optional().isInt({ min: 0 }).withMessage('Invalid guest count'),
  body('currentOrderTotal').optional().isFloat({ min: 0 }).withMessage('Invalid total'),
  body('assignedServer').optional().trim(),
  validate,
  async (req, res, next) => {
    try {
      const table = await tableService.getTableById(req.params.id);
      // Validate ownership
      const userRestaurantId = req.user.staffDetails?.restaurantId || req.user.ownerDetails?.restaurantId;
      if (table.restaurantId.toString() !== userRestaurantId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const updated = await tableService.updateTable(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// Update table status (PATCH alias for staff/owner apps)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const table = await tableService.getTableById(req.params.id);
    const userRestaurantId = req.user.staffDetails?.restaurantId || req.user.ownerDetails?.restaurantId;
    if (table.restaurantId.toString() !== userRestaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updated = await tableService.updateTable(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a table (Owner only)
router.delete('/:id', authMiddleware, requireRole('owner'), async (req, res, next) => {
  try {
    const result = await tableService.deleteTable(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
