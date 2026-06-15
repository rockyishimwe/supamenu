const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const reservationService = require('../services/reservationService');

// Get all reservations (Staff/Owner: all, Customer: only their own)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'customer') {
      query.userId = req.user.id;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await reservationService.getReservations(query, page, limit);
    res.json(result);
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
    try {
      const reservation = await reservationService.createReservation({
        restaurantId: req.body.restaurantId,
        restaurantName: req.body.restaurantName,
        userId: req.user.id,
        userName: req.user.name,
        guestsCount: req.body.guestsCount,
        reservationDate: req.body.reservationDate,
        reservationTime: req.body.reservationTime,
        notes: req.body.notes,
        tableId: req.body.tableId,
        tableNumber: req.body.tableNumber,
      });
      res.status(201).json(reservation);
    } catch (err) {
      next(err);
    }
  }
);

// Update reservation status (Cancel, Confirm, etc.)
const updateReservationChain = [
  authMiddleware,
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be: pending, confirmed, cancelled, or completed'),
  validate,
];

async function updateReservationHandler(req, res, next) {
  try {
    const reservation = await reservationService.updateReservationStatus(
      req.params.id,
      req.body.status,
      req.user.id,
      req.user.role
    );
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}

router.put('/:id', ...updateReservationChain, updateReservationHandler);
router.patch('/:id', ...updateReservationChain, updateReservationHandler);

// Delete a reservation
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await reservationService.deleteReservation(req.params.id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
