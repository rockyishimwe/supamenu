// backend/server.js — Entry point: connect DB and start the HTTP server

const config = require('./config/env'); // Validates required env vars on import
const connectDB = require('./config/db');
const app = require('./app');
const mongoose = require('mongoose');

// Connect to MongoDB and start server
connectDB().then(() => {
  const server = app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));

  // Graceful shutdown — close Mongoose and HTTP server on signal
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
    // Force shutdown after 10s
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
