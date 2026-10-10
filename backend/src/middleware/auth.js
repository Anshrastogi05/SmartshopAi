'use strict';

const jwt = require('jsonwebtoken');
const { unauthorizedError } = require('./errorHandler');

/**
 * Middleware: verify JWT token.
 * Attaches decoded user payload to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(unauthorizedError('Token expired'));
    }
    return next(unauthorizedError('Invalid token'));
  }
}

/**
 * Middleware: require authentication (alias for authenticate).
 * Use on protected routes.
 */
const requireAuth = authenticate;

/**
 * Middleware: optional authentication.
 * Does NOT block if no token, but will attach req.user if token is present and valid.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // Silently ignore invalid tokens in optional auth
  }
  next();
}

module.exports = { authenticate, requireAuth, optionalAuth };
