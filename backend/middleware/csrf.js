// backend/middleware/csrf.js
// CSRF protection middleware for state-changing API endpoints
// For JWT-based APIs, the Authorization header already mitigates standard CSRF.
// This middleware adds a SameSite-aware check as defense-in-depth.

function csrfProtection(req, res, next) {
  // Only check state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // If the request has an Authorization header (JWT), it's immune to
    // standard CSRF because browsers don't auto-send custom headers
    if (req.headers.authorization) {
      return next();
    }

    // For cookie/session-based auth, require X-Requested-With header
    const requestedWith = req.headers['x-requested-with'];
    if (requestedWith !== 'XMLHttpRequest') {
      return res.status(403).json({ message: 'CSRF validation failed' });
    }
  }

  next();
}

module.exports = csrfProtection;
