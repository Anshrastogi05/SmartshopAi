'use strict';

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const REQUIRED_ENV = ['DATABASE_URL'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missing.join(', ')}`);
  console.error('Please copy .env.example to .env and fill in all required values.');
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`[Server] ShopSmart AI backend running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
    process.exit(0);
  });
});

module.exports = server;
