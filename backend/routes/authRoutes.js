const express = require('express')

const {
  register,
  login,
  getCurrentUser,
} = require('../controllers/authController')

const authMiddleware =
  require('../middleware/authMiddleware')

const router =
  express.Router()


// =========================================
// REGISTER
// =========================================

router.post(
  '/register',
  register
)


// =========================================
// LOGIN
// =========================================

router.post(
  '/login',
  login
)


// =========================================
// CURRENT USER
// =========================================

router.get(
  '/me',
  authMiddleware,
  getCurrentUser
)


module.exports = router