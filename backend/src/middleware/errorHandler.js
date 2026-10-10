'use strict';

/**
 * Centralized error handler middleware.
 * Sends consistent JSON error responses.
 */

/**
 * 404 Not Found handler
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;

  // Log the error (avoid leaking stack in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}

/**
 * Validation error handler helper
 */
function validationError(message, details = null) {
  const error = new Error(message);
  error.status = 422;
  if (details) error.details = details;
  return error;
}

/**
 * Unauthorized error helper
 */
function unauthorizedError(message = 'Authentication required') {
  const error = new Error(message);
  error.status = 401;
  return error;
}

/**
 * Forbidden error helper
 */
function forbiddenError(message = 'Access denied') {
  const error = new Error(message);
  error.status = 403;
  return error;
}

/**
 * Not found error helper
 */
function notFoundError(resource = 'Resource') {
  const error = new Error(`${resource} not found`);
  error.status = 404;
  return error;
}

module.exports = {
  notFound,
  errorHandler,
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
};
