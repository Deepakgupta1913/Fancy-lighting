const express = require('express')

const {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getAdminOrders,
  getAdminOrderDetails,
  updateOrderStatus,
} = require('../controllers/orderController')

const authMiddleware =
  require('../middleware/authMiddleware')

const adminMiddleware =
  require('../middleware/adminMiddleware')

const router =
  express.Router()

// =========================================
// CUSTOMER ORDERS
// =========================================

// CREATE ORDER
// POST /api/orders
router.post(
  '/',
  authMiddleware,
  createOrder
)

// GET MY ORDERS
// GET /api/orders/my
router.get(
  '/my',
  authMiddleware,
  getMyOrders
)

// =========================================
// ADMIN ORDERS
// IMPORTANT:
// Ye routes /:id se pehle hone chahiye.
// =========================================

// GET ALL ORDERS
// GET /api/orders/admin
router.get(
  '/admin',
  authMiddleware,
  adminMiddleware,
  getAdminOrders
)

// GET ADMIN ORDER DETAILS
// GET /api/orders/admin/:id
router.get(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  getAdminOrderDetails
)

// UPDATE ORDER STATUS
// PUT /api/orders/admin/:id/status
router.put(
  '/admin/:id/status',
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
)

// =========================================
// CUSTOMER ORDER DETAILS
// GET /api/orders/:id
// =========================================

router.get(
  '/:id',
  authMiddleware,
  getOrderDetails
)

module.exports = router