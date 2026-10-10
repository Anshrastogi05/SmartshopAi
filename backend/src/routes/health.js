'use strict';

const express = require('express');
const router = express.Router();
const { checkConnection } = require('../db/pool');
const { sendSuccess } = require('../middleware/response');

/**
 * GET /api/health
 * Returns server status, timestamp, and DB connectivity.
 */
router.get('/', async (req, res, next) => {
  try {
    const dbTime = await checkConnection();
    return sendSuccess(res, {
      status: 'ok',
      server: 'ShopSmart AI Backend',
      version: '3.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: { status: 'connected', serverTime: dbTime },
    });
  } catch (err) {
    // DB is down but server is up
    return res.status(503).json({
      success: false,
      data: {
        status: 'degraded',
        server: 'ShopSmart AI Backend',
        timestamp: new Date().toISOString(),
        database: { status: 'disconnected', error: err.message },
      },
    });
  }
});

module.exports = router;
