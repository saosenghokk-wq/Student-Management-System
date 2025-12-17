const jwt = require('jsonwebtoken');

// Validate JWT_SECRET exists on startup
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set');
  console.error('Please add JWT_SECRET to your .env file');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long');
}

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
