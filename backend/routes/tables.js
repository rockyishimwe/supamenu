const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const { authMiddleware } = require('../middleware/auth');

// Get all tables for a restaurant
router.get('/', async (req, res) => {
  try {
    const query = req.query.restaurantId ? { restaurantId: req.query.restaurantId } : {};
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
router.post('/', authMiddleware, async (req, res) => {
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
