'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/signup   – create a new user account
router.post('/signup', authController.signup);

// POST /api/auth/login    – authenticate and get JWT
router.post('/login', authController.login);

// GET  /api/auth/me       – get current user profile (protected)
router.get('/me', requireAuth, authController.me);

// POST /api/auth/logout   – (stateless JWT – client just drops the token)
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
