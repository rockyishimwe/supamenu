// backend/utils/sanitize.js
// Strip HTML tags and trim whitespace to prevent stored XSS

function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

function sanitize(obj, fields) {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (sanitized[field] !== undefined && typeof sanitized[field] === 'string') {
      sanitized[field] = stripHtml(sanitized[field]);
    }
  }
  return sanitized;
}

module.exports = { stripHtml, sanitize };
