'use strict';

const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// GET /api/catalog/categories        – list all categories
router.get('/categories', catalogController.getCategories);

// GET /api/catalog/products          – list products (search, filter, sort, paginate)
router.get('/products', catalogController.getProducts);

// GET /api/catalog/products/:idOrSlug – get single product by id or slug
router.get('/products/:idOrSlug', catalogController.getProduct);

module.exports = router;
