const express = require('express')

const {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
} = require('../controllers/userController')

const authMiddleware =
  require('../middleware/authMiddleware')

const adminMiddleware =
  require('../middleware/adminMiddleware')

const router =
  express.Router()


router.get(
  '/customers',
  authMiddleware,
  adminMiddleware,
  getCustomers
)


router.get(
  '/customers/:id',
  authMiddleware,
  adminMiddleware,
  getCustomerById
)


router.put(
  '/customers/:id/status',
  authMiddleware,
  adminMiddleware,
  updateCustomerStatus
)


module.exports = router