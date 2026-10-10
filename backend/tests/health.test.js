'use strict';

require('./setup');
const request = require('supertest');
const app = require('../src/app');

// Mock DB for health tests
jest.mock('../src/db/pool', () => ({
  checkConnection: jest.fn().mockResolvedValue(new Date()),
  query: jest.fn(),
  closePool: jest.fn(),
}));

describe('GET /api/health', () => {
  it('should return 200 with success status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('should include server and environment fields', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.data).toHaveProperty('server');
    expect(res.body.data).toHaveProperty('environment');
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('should include database status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.data.database).toHaveProperty('status', 'connected');
  });
});

describe('404 handling', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
