'use strict';

const { query } = require('../db/pool');
const { sendSuccess } = require('../middleware/response');
const { notFoundError, validationError } = require('../middleware/errorHandler');

// ─── Helpers ────────────────────────────────────────────────────────────────

function parsePositiveInt(val, name, defaultVal) {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1) {
    throw validationError(`'${name}' must be a positive integer`);
  }
  return n;
}

function parseNonNegativeFloat(val, name) {
  const n = parseFloat(val);
  if (isNaN(n) || n < 0) {
    throw validationError(`'${name}' must be a non-negative number`);
  }
  return n;
}

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * GET /api/catalog/categories
 */
async function getCategories(req, res, next) {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.slug, c.description, c.image_url,
              COUNT(p.id) FILTER (WHERE p.is_active) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/catalog/products
 * Query params: q, category, minPrice, maxPrice, sort, page, limit
 */
async function getProducts(req, res, next) {
  try {
    const {
      q = '',
      category = '',
      minPrice,
      maxPrice,
      sort = 'created_at_desc',
      page = '1',
      limit = '12',
    } = req.query;

    // Validate page and limit
    let pageNum, limitNum;
    try {
      pageNum = parsePositiveInt(page, 'page', 1);
      limitNum = Math.min(parsePositiveInt(limit, 'limit', 12), 100); // cap at 100
    } catch (err) {
      return next(err);
    }

    let minPriceVal, maxPriceVal;
    if (minPrice !== undefined) {
      try { minPriceVal = parseNonNegativeFloat(minPrice, 'minPrice'); } catch (e) { return next(e); }
    }
    if (maxPrice !== undefined) {
      try { maxPriceVal = parseNonNegativeFloat(maxPrice, 'maxPrice'); } catch (e) { return next(e); }
    }

    if (minPriceVal !== undefined && maxPriceVal !== undefined && minPriceVal > maxPriceVal) {
      return next(validationError('minPrice cannot be greater than maxPrice'));
    }

    // Whitelist sort options
    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating_desc: 'p.rating DESC',
      name_asc: 'p.name ASC',
      newest: 'p.created_at DESC',
      created_at_desc: 'p.created_at DESC',
      popular: 'p.review_count DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    const params = [];
    const conditions = ['p.is_active = TRUE'];

    // Full-text search
    if (q.trim()) {
      params.push(q.trim());
      conditions.push(`to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $${params.length})`);
    }

    // Category filter (by slug)
    if (category.trim()) {
      params.push(category.trim());
      conditions.push(`c.slug = $${params.length}`);
    }

    // Price filters
    if (minPriceVal !== undefined) {
      params.push(minPriceVal);
      conditions.push(`p.price >= $${params.length}`);
    }
    if (maxPriceVal !== undefined) {
      params.push(maxPriceVal);
      conditions.push(`p.price <= $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Data query
    const offset = (pageNum - 1) * limitNum;
    params.push(limitNum, offset);
    const dataResult = await query(
      `SELECT p.id, p.name, p.slug, p.sku, p.description,
              p.price, p.original_price, p.brand, p.image_url,
              p.rating, p.review_count, p.tags, p.created_at,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
              COALESCE(i.quantity - i.reserved, 0) AS stock_available
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const totalPages = Math.ceil(totalCount / limitNum);

    return sendSuccess(res, dataResult.rows, {
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/catalog/products/:idOrSlug
 */
async function getProduct(req, res, next) {
  try {
    const { idOrSlug } = req.params;

    // Try UUID first, then slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(idOrSlug);

    const result = await query(
      `SELECT p.id, p.name, p.slug, p.sku, p.description,
              p.price, p.original_price, p.brand, p.image_url, p.images,
              p.rating, p.review_count, p.tags, p.created_at, p.updated_at,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
              COALESCE(i.quantity - i.reserved, 0) AS stock_available,
              i.quantity AS stock_quantity
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.is_active = TRUE AND ${isUUID ? 'p.id = $1' : 'p.slug = $1'}`,
      [idOrSlug]
    );

    if (result.rows.length === 0) {
      return next(notFoundError('Product'));
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, getProducts, getProduct };
