const express = require('express')

const {
  sendVerificationOtp,
  verifyOtp,
} = require('../controllers/verificationController')

const authMiddleware =
  require('../middleware/authMiddleware')

const router =
  express.Router()


// =========================================
// SEND OTP
// =========================================

router.post(
  '/send-otp',
  authMiddleware,
  sendVerificationOtp
)


// =========================================
// VERIFY OTP
// =========================================

router.post(
  '/verify-otp',
  authMiddleware,
  verifyOtp
)


module.exports = router