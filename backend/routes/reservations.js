const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { authMiddleware } = require('../middleware/auth');

// Get all reservations (Staff/Owner: all, Customer: only their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.userId = req.user.id;
    }
    const reservations = await Reservation.find(query).sort({ reservationDate: -1, reservationTime: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a reservation
router.post('/', authMiddleware, async (req, res) => {
  const { restaurantId, restaurantName, guestsCount, reservationDate, reservationTime, notes, tableId, tableNumber } = req.body;
  try {
    const reservation = new Reservation({
      restaurantId,
      restaurantName,
      userId: req.user.id,
      userName: req.user.name,
      guestsCount,
      reservationDate,
      reservationTime,
      notes,
      tableId,
      tableNumber
    });

    await reservation.save();

    // If a specific table was selected, optionally reserve it
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { 
        status: 'reserved',
        currentGuestName: req.user.name,
        currentGuestsCount: guestsCount
      });
    }

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update reservation status (Cancel, Confirm, etc.)
async function updateReservation(req, res) {
  const { status } = req.body;
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // Validate permission: Customer can only cancel their own. Staff/Owner can do anything.
    if (req.user.role === 'customer' && reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    reservation.status = status;
    await reservation.save();

    // If reservation is completed/cancelled, make table available again
    if (reservation.tableId && (status === 'cancelled' || status === 'completed')) {
      await Table.findByIdAndUpdate(reservation.tableId, { 
        status: 'available',
        currentGuestName: '',
        currentGuestsCount: 0
      });
    } else if (reservation.tableId && status === 'confirmed') {
      await Table.findByIdAndUpdate(reservation.tableId, { 
        status: 'reserved'
      });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

router.put('/:id', authMiddleware, updateReservation);
router.patch('/:id', authMiddleware, updateReservation);

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (req.user.role === 'customer' && reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (reservation.tableId) {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'available', currentGuestName: '', currentGuestsCount: 0 });
    }
    await reservation.deleteOne();
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
