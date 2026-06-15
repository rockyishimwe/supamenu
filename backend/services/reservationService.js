const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

async function getReservations(query = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [reservations, total] = await Promise.all([
    Reservation.find(query).sort({ reservationDate: -1, reservationTime: -1 }).skip(skip).limit(limit),
    Reservation.countDocuments(query),
  ]);
  return {
    data: reservations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function createReservation(data) {
  const reservation = new Reservation({
    restaurantId: data.restaurantId,
    restaurantName: data.restaurantName,
    userId: data.userId,
    userName: data.userName,
    guestsCount: data.guestsCount,
    reservationDate: data.reservationDate,
    reservationTime: data.reservationTime,
    notes: data.notes,
    tableId: data.tableId,
    tableNumber: data.tableNumber,
  });
  await reservation.save();

  if (data.tableId) {
    await Table.findByIdAndUpdate(data.tableId, {
      status: 'reserved',
      currentGuestName: data.userName,
      currentGuestsCount: data.guestsCount,
    });
  }

  return reservation;
}

async function updateReservationStatus(id, status, userId, userRole) {
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    const err = new Error('Reservation not found');
    err.status = 404;
    throw err;
  }

  if (userRole === 'customer' && reservation.userId.toString() !== userId) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  reservation.status = status;
  await reservation.save();

  if (reservation.tableId) {
    if (status === 'cancelled' || status === 'completed') {
      await Table.findByIdAndUpdate(reservation.tableId, {
        status: 'available',
        currentGuestName: '',
        currentGuestsCount: 0,
      });
    } else if (status === 'confirmed') {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'reserved' });
    }
  }

  return reservation;
}

async function deleteReservation(id, userId, userRole) {
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    const err = new Error('Reservation not found');
    err.status = 404;
    throw err;
  }
  if (userRole === 'customer' && reservation.userId.toString() !== userId) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  if (reservation.tableId) {
    await Table.findByIdAndUpdate(reservation.tableId, {
      status: 'available',
      currentGuestName: '',
      currentGuestsCount: 0,
    });
  }
  await reservation.deleteOne();
  return { message: 'Reservation deleted' };
}

module.exports = { getReservations, createReservation, updateReservationStatus, deleteReservation };
