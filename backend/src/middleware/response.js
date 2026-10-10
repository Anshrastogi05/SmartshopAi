'use strict';

/**
 * Consistent API response helpers.
 * All responses follow the shape: { success, data|error, meta? }
 */

function sendSuccess(res, data, { statusCode = 200, message = null, meta = null } = {}) {
  const payload = { success: true };
  if (message) payload.message = message;
  payload.data = data;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function sendCreated(res, data, message = 'Resource created successfully') {
  return sendSuccess(res, data, { statusCode: 201, message });
}

function sendNoContent(res) {
  return res.status(204).send();
}

function sendError(res, message, statusCode = 500, details = null) {
  const payload = { success: false, error: { message } };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
}

module.exports = { sendSuccess, sendCreated, sendNoContent, sendError };
