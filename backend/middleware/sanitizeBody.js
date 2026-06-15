const { sanitize } = require('../utils/sanitize');

/**
 * Auto-sanitize request body string fields.
 * Protects against stored XSS by stripping HTML tags from user input.
 * Register AFTER express.json() so req.body is populated.
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const stringFields = Object.keys(req.body).filter(
      (key) => typeof req.body[key] === 'string'
    );
    req.body = sanitize(req.body, stringFields);
  }
  next();
}

module.exports = sanitizeBody;
