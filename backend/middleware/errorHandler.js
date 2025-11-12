const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    console.error(`[${err.statusCode}] ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  console.error('=== UNHANDLED ERROR ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  return res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
