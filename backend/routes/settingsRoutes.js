const express = require('express')

const {
  getStoreSettings,
  updateStoreSettings,
} = require('../controllers/settingsController')

const authMiddleware =
  require('../middleware/authMiddleware')

const adminMiddleware =
  require('../middleware/adminMiddleware')

const router = express.Router()

// Public storefront settings.
router.get(
  '/',
  getStoreSettings
)

// Admin-only settings update.
router.put(
  '/',
  authMiddleware,
  adminMiddleware,
  updateStoreSettings
)

module.exports = router
