const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Table = require('../models/Table');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get all tables for a restaurant
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    
    if (user.role === 'customer') {
      if (!req.query.restaurantId) return res.status(400).json({ message: 'restaurantId required' });
      query = { restaurantId: req.query.restaurantId };
    } else {
      // staff or owner
      const restaurantId = user.staffDetails?.restaurantId || user.ownerDetails?.restaurantId;
      if (!restaurantId) return res.status(403).json({ message: 'No restaurant assigned' });
      query = { restaurantId };
    }

    const tables = await Table.find(query).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

async function updateTableHandler(req, res) {
  const { status, currentDuration, currentGuestName, currentGuestsCount, currentOrderTotal, assignedServer } = req.body;
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    // Validate ownership
    const userRestaurantId = req.user.staffDetails?.restaurantId || req.user.ownerDetails?.restaurantId;
    if (table.restaurantId.toString() !== userRestaurantId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    if (status !== undefined) table.status = status;
    if (currentDuration !== undefined) table.currentDuration = currentDuration;
    if (currentGuestName !== undefined) table.currentGuestName = currentGuestName;
    if (currentGuestsCount !== undefined) table.currentGuestsCount = currentGuestsCount;
    if (currentOrderTotal !== undefined) table.currentOrderTotal = currentOrderTotal;
    if (assignedServer !== undefined) table.assignedServer = assignedServer;

    await table.save();
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

router.put('/:id', authMiddleware, updateTableHandler);
router.patch('/:id/status', authMiddleware, updateTableHandler);

// Create a table (Owner only)
router.post('/',
  authMiddleware,
  body('restaurantId').notEmpty().withMessage('restaurantId is required'),
  body('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a positive integer'),
  body('capacity').isInt({ min: 1 }).withMessage('capacity must be at least 1'),
  validate,
  async (req, res) => {
  if (req.user.role !== 'owner' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { restaurantId, tableNumber, capacity, location, x, y, width, height, shape, status } = req.body;
  try {
    const table = new Table({
      restaurantId,
      tableNumber,
      capacity,
      location: location || 'Main Floor',
      x,
      y,
      width: width || 80,
      height: height || 80,
      shape: shape || 'square',
      status: status || 'available'
    });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a table (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied: Owners only' });
  }
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
