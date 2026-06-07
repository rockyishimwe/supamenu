const logger = require('../utils/logger');

const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];
const OPTIONAL_VARS = [
  { key: 'PORT', default: '5000' },
  { key: 'CORS_ORIGIN', default: 'http://localhost:3000' },
];

function validate() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Create a .env file in backend/ based on .env.example');
    process.exit(1);
  }

  for (const { key, default: val } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      process.env[key] = val;
      logger.info(`${key} not set, using default: ${val}`);
    }
  }

  logger.info('Environment variables validated');
}

module.exports = validate;
