'use strict';

require('./setup');
const request = require('supertest');
const app = require('../src/app');

const mockQuery = jest.fn();
jest.mock('../src/db/pool', () => ({
  query: (...args) => mockQuery(...args),
  checkConnection: jest.fn().mockResolvedValue(new Date()),
  closePool: jest.fn(),
}));

function makeProduct(overrides = {}) {
  return {
    id: 'prod-1',
    name: 'Test Product',
    slug: 'test-product',
    sku: 'TEST-001',
    description: 'A great test product',
    price: '99.99',
    original_price: '129.99',
    brand: 'TestBrand',
    image_url: 'https://example.com/img.jpg',
    rating: '4.5',
    review_count: 100,
    tags: ['tag1'],
    created_at: new Date(),
    category_id: 'cat-1',
    category_name: 'Electronics',
    category_slug: 'electronics',
    stock_available: 50,
    ...overrides,
  };
}

describe('GET /api/catalog/products', () => {
  beforeEach(() => mockQuery.mockReset());

  it('should return paginated products', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: '5' }] })
      .mockResolvedValueOnce({ rows: [makeProduct(), makeProduct({ id: 'prod-2', slug: 'test-2', sku: 'TEST-002' })] });

    const res = await request(app).get('/api/catalog/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta.total).toBe(5);
    expect(res.body.meta.page).toBe(1);
  });

  it('should handle search query param', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [makeProduct()] });

    const res = await request(app).get('/api/catalog/products?q=headphones');
    expect(res.status).toBe(200);
  });

  it('should reject invalid page param', async () => {
    const res = await request(app).get('/api/catalog/products?page=abc');
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject negative minPrice', async () => {
    const res = await request(app).get('/api/catalog/products?minPrice=-10');
    expect(res.status).toBe(422);
  });

  it('should reject minPrice > maxPrice', async () => {
    const res = await request(app).get('/api/catalog/products?minPrice=500&maxPrice=100');
    expect(res.status).toBe(422);
  });

  it('should handle price range filter', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: '2' }] })
      .mockResolvedValueOnce({ rows: [makeProduct({ price: '49.99' })] });

    const res = await request(app).get('/api/catalog/products?minPrice=10&maxPrice=100');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/catalog/products/:idOrSlug', () => {
  beforeEach(() => mockQuery.mockReset());

  it('should return product by slug', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeProduct()] });

    const res = await request(app).get('/api/catalog/products/test-product');
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe('test-product');
  });

  it('should return 404 for unknown slug', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/catalog/products/not-real');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/catalog/categories', () => {
  beforeEach(() => mockQuery.mockReset());

  it('should return list of categories', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'cat-1', name: 'Electronics', slug: 'electronics', product_count: '5' },
        { id: 'cat-2', name: 'Clothing', slug: 'clothing', product_count: '3' },
      ],
    });

    const res = await request(app).get('/api/catalog/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});
