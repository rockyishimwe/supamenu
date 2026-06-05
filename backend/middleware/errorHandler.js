function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    errors: err.errors || undefined,
  });
}

module.exports = errorHandler;
