const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get all reservations (Staff/Owner: all, Customer: only their own)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.userId = req.user.id;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [reservations, total] = await Promise.all([
      Reservation.find(query).sort({ reservationDate: -1, reservationTime: -1 }).skip(skip).limit(limit),
      Reservation.countDocuments(query),
    ]);
    res.json({ data: reservations, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// Create a reservation
router.post('/',
  authMiddleware,
  body('restaurantId').notEmpty().withMessage('restaurantId is required'),
  body('guestsCount').isInt({ min: 1 }).withMessage('guestsCount must be a positive integer'),
  body('reservationDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('reservationDate must be YYYY-MM-DD'),
  body('reservationTime').notEmpty().withMessage('reservationTime is required'),
  body('tableId').optional().isMongoId().withMessage('Invalid tableId'),
  body('notes').optional().trim(),
  validate,
  async (req, res, next) => {
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
    next(err);
  }
});

// Update reservation status (Cancel, Confirm, etc.)
async function updateReservation(req, res, next) {
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
    next(err);
  }
}

const updateReservationChain = [
  authMiddleware,
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be: pending, confirmed, cancelled, or completed'),
  validate,
];
router.put('/:id', ...updateReservationChain, updateReservation);
router.patch('/:id', ...updateReservationChain, updateReservation);

router.delete('/:id', authMiddleware, async (req, res, next) => {
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
    next(err);
  }
});

module.exports = router;
