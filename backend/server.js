// backend/server.js — Entry point: connect DB and start the HTTP server

const config = require('./config/env'); // Validates required env vars on import
const connectDB = require('./config/db');
const app = require('./app');

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
});
