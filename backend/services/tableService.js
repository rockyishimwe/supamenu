const Table = require('../models/Table');

async function getTables(query = {}) {
  const filter = {};
  if (query.restaurantId) filter.restaurantId = query.restaurantId;
  return Table.find(filter).sort({ tableNumber: 1 });
}

async function getTableById(id) {
  const table = await Table.findById(id);
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }
  return table;
}

async function createTable(data) {
  const table = new Table({
    restaurantId: data.restaurantId,
    tableNumber: data.tableNumber,
    capacity: data.capacity,
    location: data.location || 'Main Floor',
    x: data.x,
    y: data.y,
    width: data.width || 80,
    height: data.height || 80,
    shape: data.shape || 'square',
    status: data.status || 'available',
  });
  return table.save();
}

async function updateTable(id, updates) {
  const table = await getTableById(id);
  const allowedFields = ['status', 'currentDuration', 'currentGuestName', 'currentGuestsCount', 'currentOrderTotal', 'assignedServer'];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      table[field] = updates[field];
    }
  }
  return table.save();
}

async function deleteTable(id) {
  const table = await Table.findByIdAndDelete(id);
  if (!table) {
    const err = new Error('Table not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Table deleted successfully' };
}

module.exports = { getTables, getTableById, createTable, updateTable, deleteTable };
