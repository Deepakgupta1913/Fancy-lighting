const express = require('express')

const {
  getProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

const authMiddleware =
  require('../middleware/authMiddleware')

const adminMiddleware =
  require('../middleware/adminMiddleware')

const router =
  express.Router()


// ========================================
// PUBLIC PRODUCTS
// ========================================
//
// GET /api/products
//
// Only ACTIVE products.
// ========================================

router.get(
  '/',
  getProducts
)


// ========================================
// ADMIN PRODUCTS
// ========================================
//
// GET /api/products/admin/all
//
// Active + Inactive products.
// ========================================

router.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  getAdminProducts
)


// ========================================
// CREATE PRODUCT
// ========================================
//
// POST /api/products
// ADMIN ONLY
// ========================================

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  createProduct
)


// ========================================
// UPDATE PRODUCT
// ========================================
//
// PUT /api/products/:id
// ADMIN ONLY
// ========================================

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  updateProduct
)


// ========================================
// DELETE PRODUCT
// ========================================
//
// DELETE /api/products/:id
// ADMIN ONLY
// ========================================

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteProduct
)


module.exports = router