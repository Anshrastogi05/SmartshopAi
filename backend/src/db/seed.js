'use strict';

require('dotenv').config();
const { query, closePool } = require('./pool');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('[Migrate] Running database migrations...');
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8');
  await query(sql);
  console.log('[Migrate] Migrations completed successfully.');
}

async function seedDatabase() {
  console.log('[Seed] Seeding database...');

  // Categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices and tech accessories', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion for every occasion', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Everything for your home', image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Gear for active lifestyles', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400' },
    { name: 'Books', slug: 'books', description: 'Knowledge and entertainment', image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
    { name: 'Beauty & Health', slug: 'beauty-health', description: 'Personal care and wellness', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const result = await query(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, slug`,
      [cat.name, cat.slug, cat.description, cat.image_url]
    );
    categoryMap[cat.slug] = result.rows[0].id;
  }
  console.log('[Seed] Categories seeded.');

  // Products
  const products = [
    // Electronics
    { name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh-1000xm5', sku: 'ELEC-001', category: 'electronics', price: 349.99, original_price: 399.99, brand: 'Sony', description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life.', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', rating: 4.8, review_count: 2847, tags: ['headphones', 'wireless', 'noise-canceling'] },
    { name: 'Apple MacBook Pro 14"', slug: 'apple-macbook-pro-14', sku: 'ELEC-002', category: 'electronics', price: 1999.00, original_price: 2199.00, brand: 'Apple', description: 'Supercharged by M3 Pro chip. Stunning Liquid Retina XDR display with incredible performance.', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', rating: 4.9, review_count: 1523, tags: ['laptop', 'apple', 'macbook'] },
    { name: 'Samsung 4K QLED TV 55"', slug: 'samsung-4k-qled-55', sku: 'ELEC-003', category: 'electronics', price: 799.99, original_price: 999.99, brand: 'Samsung', description: 'Quantum Dot technology meets 4K resolution. AI-powered picture quality for the ultimate viewing experience.', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', rating: 4.6, review_count: 934, tags: ['tv', 'qled', '4k', 'samsung'] },
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', sku: 'ELEC-004', category: 'electronics', price: 999.00, brand: 'Apple', description: 'Titanium design. A17 Pro chip. The most powerful iPhone ever with ProRes video recording.', image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600', rating: 4.7, review_count: 3201, tags: ['smartphone', 'apple', 'iphone'] },
    { name: 'Canon EOS R6 Mark II', slug: 'canon-eos-r6-mark-ii', sku: 'ELEC-005', category: 'electronics', price: 2499.00, original_price: 2699.00, brand: 'Canon', description: 'Full-frame mirrorless camera with 40fps burst shooting and advanced AI subject detection.', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600', rating: 4.8, review_count: 412, tags: ['camera', 'mirrorless', 'photography'] },
    // Clothing
    { name: "Levi's 501 Original Jeans", slug: 'levis-501-original', sku: 'CLTH-001', category: 'clothing', price: 69.99, original_price: 89.99, brand: "Levi's", description: 'The original straight fit jean that started it all. Made with rigid denim for a classic look.', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', rating: 4.4, review_count: 8923, tags: ['jeans', 'denim', 'classic'] },
    { name: 'Nike Air Force 1 Sneakers', slug: 'nike-air-force-1', sku: 'CLTH-002', category: 'clothing', price: 110.00, brand: 'Nike', description: 'The legend returns. The 1982 original, now in premium leather for everyday wear.', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', rating: 4.7, review_count: 15234, tags: ['sneakers', 'nike', 'shoes'] },
    { name: 'Patagonia Better Sweater', slug: 'patagonia-better-sweater', sku: 'CLTH-003', category: 'clothing', price: 139.00, brand: 'Patagonia', description: '100% recycled polyester fleece with a sweater-like appearance. Fair Trade Certified sewn.', image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', rating: 4.6, review_count: 2341, tags: ['fleece', 'sustainable', 'outdoor'] },
    // Home & Garden
    { name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15-detect', sku: 'HOME-001', category: 'home-garden', price: 749.99, original_price: 849.99, brand: 'Dyson', description: 'Laser reveals invisible dust. Powerful suction with intelligent suction auto-adjustment.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', rating: 4.5, review_count: 1876, tags: ['vacuum', 'dyson', 'cleaning'] },
    { name: 'Instant Pot Duo 7-in-1', slug: 'instant-pot-duo-7in1', sku: 'HOME-002', category: 'home-garden', price: 79.99, original_price: 99.99, brand: 'Instant Pot', description: 'Replace 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', rating: 4.7, review_count: 45621, tags: ['kitchen', 'cooking', 'pressure-cooker'] },
    // Sports
    { name: 'Peloton Bike+', slug: 'peloton-bike-plus', sku: 'SPRT-001', category: 'sports-outdoors', price: 2495.00, brand: 'Peloton', description: 'Auto-follow resistance. 23.8" rotating HD touchscreen. Access 10,000+ classes on demand.', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', rating: 4.5, review_count: 3421, tags: ['fitness', 'cycling', 'indoor'] },
    { name: 'Hydro Flask 32 oz Water Bottle', slug: 'hydro-flask-32oz', sku: 'SPRT-002', category: 'sports-outdoors', price: 44.95, original_price: 54.95, brand: 'Hydro Flask', description: 'TempShield insulation keeps drinks cold 24 hrs, hot 12 hrs. BPA-free and phthalate-free.', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', rating: 4.8, review_count: 12089, tags: ['water-bottle', 'hydration', 'outdoor'] },
    // Books
    { name: 'Atomic Habits by James Clear', slug: 'atomic-habits-james-clear', sku: 'BOOK-001', category: 'books', price: 14.99, original_price: 27.00, brand: 'Penguin Random House', description: 'An easy & proven way to build good habits and break bad ones. #1 New York Times bestseller.', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', rating: 4.8, review_count: 89234, tags: ['self-help', 'habits', 'bestseller'] },
    { name: 'The Pragmatic Programmer', slug: 'pragmatic-programmer', sku: 'BOOK-002', category: 'books', price: 49.99, brand: 'Addison-Wesley', description: '20th Anniversary Edition. From journeyman to master. An essential guide for software developers.', image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600', rating: 4.7, review_count: 3821, tags: ['programming', 'software', 'technical'] },
    // Beauty
    { name: 'CeraVe Moisturizing Cream', slug: 'cerave-moisturizing-cream', sku: 'BEAU-001', category: 'beauty-health', price: 19.99, original_price: 24.99, brand: 'CeraVe', description: 'Developed with dermatologists. Formulated with essential ceramides to help restore skin barrier.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600', rating: 4.8, review_count: 34521, tags: ['skincare', 'moisturizer', 'dermatologist'] },
  ];

  for (const p of products) {
    const categoryId = categoryMap[p.category];
    const productResult = await query(
      `INSERT INTO products (category_id, name, slug, sku, description, price, original_price, brand, image_url, rating, review_count, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()
       RETURNING id`,
      [categoryId, p.name, p.slug, p.sku, p.description, p.price, p.original_price || null, p.brand, p.image_url, p.rating, p.review_count, p.tags]
    );
    const productId = productResult.rows[0].id;

    // Create inventory record
    const stockQty = Math.floor(Math.random() * 200) + 10;
    await query(
      `INSERT INTO inventory (product_id, quantity, reserved)
       VALUES ($1, $2, 0)
       ON CONFLICT (product_id) DO NOTHING`,
      [productId, stockQty]
    );
  }
  console.log('[Seed] Products and inventory seeded.');
}

async function main() {
  try {
    await runMigrations();
    await seedDatabase();
    console.log('[DB Setup] Complete! Database is ready.');
  } catch (err) {
    console.error('[DB Setup] Failed:', err.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
