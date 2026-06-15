// backend/config/env.js
// Centralized configuration with early validation of required env vars

const dotenv = require('dotenv');

dotenv.config();

const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    console.error(`FATAL ERROR: ${key} environment variable is required.`);
    console.error(`Set ${key} in your .env file before starting the server.`);
    process.exit(1);
  }
}

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  // SMTP mail transport
  SMTP: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'noreply@dineflow.app',
  },
};
