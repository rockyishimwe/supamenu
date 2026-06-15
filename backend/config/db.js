// backend/config/db.js
// Database connection utility

const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  const uri = config.MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('FATAL ERROR: MONGO_URI environment variable is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
