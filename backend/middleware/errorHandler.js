const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message || err);

  // Determine status code
  const status = err.status || 500;

  // Determine message to return to client
  // For 500 errors, hide internal details to avoid leaking sensitive info
  // For application errors (4xx), pass through the specific message
  let clientMessage;
  if (status >= 500) {
    clientMessage = 'Internal server error';
  } else {
    clientMessage = err.message || 'An error occurred';
  }

  const response = {
    message: clientMessage,
  };

  // Only include validation errors in the response (express-validator)
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
