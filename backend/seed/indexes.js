const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function ensureIndexes() {
  const db = mongoose.connection.db;
  if (!db) {
    logger.info('No database connection, skipping index creation');
    return;
  }

  const collections = await db.listCollections().toArray();
  const colNames = collections.map(c => c.name);

  // User indexes
  if (colNames.includes('users')) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
    await db.collection('users').createIndex({ role: 1 }, { background: true });
  }

  // Order indexes
  if (colNames.includes('orders')) {
    await db.collection('orders').createIndex({ userId: 1 }, { background: true });
    await db.collection('orders').createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await db.collection('orders').createIndex({ restaurantId: 1 }, { background: true });
    await db.collection('orders').createIndex({ restaurantId: 1, status: 1 }, { background: true });
    await db.collection('orders').createIndex({ status: 1 }, { background: true });
  }

  // Reservation indexes
  if (colNames.includes('reservations')) {
    await db.collection('reservations').createIndex({ userId: 1 }, { background: true });
    await db.collection('reservations').createIndex({ restaurantId: 1 }, { background: true });
    await db.collection('reservations').createIndex({ restaurantId: 1, reservationDate: 1 }, { background: true });
  }

  // Table indexes
  if (colNames.includes('tables')) {
    await db.collection('tables').createIndex({ restaurantId: 1 }, { background: true });
    await db.collection('tables').createIndex({ restaurantId: 1, status: 1 }, { background: true });
  }

  // MenuItem indexes
  if (colNames.includes('menuitems')) {
    await db.collection('menuitems').createIndex({ restaurantId: 1 }, { background: true });
  }

  // Restaurant indexes
  if (colNames.includes('restaurants')) {
    await db.collection('restaurants').createIndex({ inviteCode: 1 }, { unique: true, sparse: true, background: true });
  }

  logger.info('Database indexes ensured.');
}

module.exports = ensureIndexes;
