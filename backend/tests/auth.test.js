'use strict';

require('./setup');
const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

// ─── DB Mock ─────────────────────────────────────────────────────────────────
const mockQuery = jest.fn();
jest.mock('../src/db/pool', () => ({
  query: (...args) => mockQuery(...args),
  checkConnection: jest.fn().mockResolvedValue(new Date()),
  closePool: jest.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeToken(payload = {}) {
  return jwt.sign(
    { id: 'test-user-id', email: 'user@test.com', role: 'customer', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// ─── Signup Tests ─────────────────────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  beforeEach(() => mockQuery.mockReset());

  it('should create a new user and return a token', async () => {
    // First call: check existing user → no rows
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      // Second call: insert user → return user row
      .mockResolvedValueOnce({
        rows: [{
          id: 'new-user-id',
          email: 'newuser@example.com',
          first_name: 'New',
          last_name: 'User',
          role: 'customer',
          is_active: true,
          created_at: new Date(),
        }],
      });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'newuser@example.com', password: 'SecurePass123', firstName: 'New', lastName: 'User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('newuser@example.com');
    // Ensure password is never returned
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('should reject duplicate email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'existing@example.com', password: 'SecurePass123', firstName: 'A', lastName: 'B' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'short', firstName: 'A', lastName: 'B' });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toMatch(/Validation failed/);
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: 'SecurePass123', firstName: 'A', lastName: 'B' });

    expect(res.status).toBe(422);
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(422);
  });
});

// ─── Login Tests ──────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => mockQuery.mockReset());

  it('should return a token for valid credentials', async () => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('CorrectPass123', 12);

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'user-123',
        email: 'user@example.com',
        password_hash: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        role: 'customer',
        is_active: true,
        created_at: new Date(),
      }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'CorrectPass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('should reject wrong password with 401', async () => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('RealPassword', 12);

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'user-123',
        email: 'user@example.com',
        password_hash: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        role: 'customer',
        is_active: true,
      }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent user with 401', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'SomePass123' });

    expect(res.status).toBe(401);
    // Must use the same generic message to avoid user enumeration
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  it('should reject missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(422);
  });
});

// ─── Protected Route Tests ────────────────────────────────────────────────────
describe('GET /api/auth/me (protected)', () => {
  beforeEach(() => mockQuery.mockReset());

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totally.invalid.token');

    expect(res.status).toBe(401);
  });

  it('should return user profile with valid token', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'test-user-id',
        email: 'user@test.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer',
        is_active: true,
        created_at: new Date(),
      }],
    });

    const token = makeToken();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('user@test.com');
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('should return 401 with expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 'test-user-id', email: 'user@test.com', role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Token expired');
  });
});
