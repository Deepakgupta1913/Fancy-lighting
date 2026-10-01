const jwt = require('jsonwebtoken')

// =========================================
// AUTHENTICATION MIDDLEWARE
// =========================================

function authMiddleware(req, res, next) {
  try {
    // =====================================
    // 1. Get Authorization Header
    // =====================================

    const authHeader =
      req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          'Authorization token is required.',
      })
    }

    // =====================================
    // 2. Check Bearer Token
    // =====================================

    if (
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid authorization format.',
      })
    }

    // =====================================
    // 3. Extract JWT Token
    // =====================================

    const token =
      authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication token is missing.',
      })
    }

    // =====================================
    // 4. Verify JWT
    // =====================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      )

    // =====================================
    // 5. Store User Information
    // =====================================

    req.user = decoded

    // =====================================
    // 6. Continue to Next Handler
    // =====================================

    next()

  } catch (error) {

    console.error(
      'Authentication Error:',
      error.message
    )

    return res.status(401).json({
      success: false,
      message:
        'Invalid or expired authentication token.',
    })
  }
}

module.exports = authMiddleware