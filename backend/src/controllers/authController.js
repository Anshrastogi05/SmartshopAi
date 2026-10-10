'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');
const { sendSuccess, sendCreated } = require('../middleware/response');
const { validationError, unauthorizedError, notFoundError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';

// ─── Validation Helpers ─────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSignupInput({ email, password, firstName, lastName }) {
  const errors = [];
  if (!email || !isValidEmail(email)) errors.push('Valid email is required');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  if (!firstName || firstName.trim().length < 1) errors.push('First name is required');
  if (!lastName || lastName.trim().length < 1) errors.push('Last name is required');
  if (errors.length) throw validationError('Validation failed', errors);
}

function validateLoginInput({ email, password }) {
  const errors = [];
  if (!email || !isValidEmail(email)) errors.push('Valid email is required');
  if (!password) errors.push('Password is required');
  if (errors.length) throw validationError('Validation failed', errors);
}

// ─── Token Factory ──────────────────────────────────────────────────────────

function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// ─── Safe User Projection ────────────────────────────────────────────────────

function safeUser(user) {
  const { password_hash, ...rest } = user;  // eslint-disable-line no-unused-vars
  return rest;
}

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 */
async function signup(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body;

    validateSignupInput({ email, password, firstName, lastName });

    // Check for existing user
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return next(validationError('An account with this email already exists'));
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [email.toLowerCase(), password_hash, firstName.trim(), lastName.trim()]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return sendCreated(res, { user: safeUser(user), token }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    validateLoginInput({ email, password });

    // Fetch user
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Generic error to avoid user enumeration
      return next(unauthorizedError('Invalid email or password'));
    }

    const user = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return next(unauthorizedError('Invalid email or password'));
    }

    const token = generateToken(user);

    return sendSuccess(res, { user: safeUser(user), token }, { message: 'Login successful' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me  (requires authentication)
 */
async function me(req, res, next) {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return next(notFoundError('User'));
    }

    return sendSuccess(res, { user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * JWT is stateless; client just drops the token.
 * We confirm on the server side.
 */
async function logout(req, res, next) {
  try {
    return sendSuccess(res, null, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me, logout };
