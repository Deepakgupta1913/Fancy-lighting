function adminMiddleware(
  req,
  res,
  next
) {
  // =====================================
  // AUTH MIDDLEWARE SHOULD RUN FIRST
  // =====================================

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message:
        'Authentication required.',
    })
  }

  // =====================================
  // CHECK ADMIN ROLE
  // =====================================

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message:
        'Admin access required.',
    })
  }

  // =====================================
  // ADMIN VERIFIED
  // =====================================

  next()
}

module.exports =
  adminMiddleware