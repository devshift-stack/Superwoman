
/**
 * Express Error Handling Middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Server Fehler:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Interner Serverfehler';

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
