'use strict';

/**
 * Test setup file.
 * Configures environment variables for all tests.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/shopsmart_test';
process.env.JWT_SECRET = 'test-jwt-secret-not-for-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:5173';
