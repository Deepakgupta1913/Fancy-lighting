const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { pool } = require('../config/db')

// =========================================
// REGISTER
// =========================================

async function register(req, res) {
  try {
    const {
      name,
      email,
      mobile,
      password,
    } = req.body

    // Basic validation
    if (
      !name ||
      !email ||
      !mobile ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email, mobile and password are required.',
      })
    }

    // Check existing user
    const [existingUsers] =
      await pool.execute(
        `
        SELECT id
        FROM users
        WHERE email = ? OR mobile = ?
        `,
        [email, mobile]
      )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'Email or mobile number is already registered.',
      })
    }

    // Hash password
    const passwordHash =
      await bcrypt.hash(password, 10)

    // Save user
    const [result] =
      await pool.execute(
        `
        INSERT INTO users
        (
          name,
          email,
          mobile,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          name,
          email,
          mobile,
          passwordHash,
          'CUSTOMER',
        ]
      )

    return res.status(201).json({
      success: true,
      message:
        'Account created successfully.',
      userId: result.insertId,
    })

  } catch (error) {
    console.error(
      'Register Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Internal server error.',
    })
  }
}


// =========================================
// LOGIN
// =========================================

async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body

    // Basic validation
    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Email and password are required.',
      })
    }

    // Find user
    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          mobile,
          password_hash,
          role,
          email_verified,
          mobile_verified,
          created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password.',
      })
    }

    const user = users[0]

    // Compare password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password_hash
      )

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password.',
      })
    }

    // Create JWT
    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn:
            process.env.JWT_EXPIRES_IN ||
            '1d',
        }
      )

    // Never send password hash to React
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      emailVerified:
        Boolean(
          user.email_verified
        ),
      mobileVerified:
        Boolean(
          user.mobile_verified
        ),
      createdAt:
        user.created_at,
    }

    return res.status(200).json({
      success: true,
      message:
        'Login successful.',
      token,
      user: safeUser,
    })

  } catch (error) {
    console.error(
      'Login Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Internal server error.',
    })
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
}


// =========================================
// GET CURRENT USER
// =========================================

async function getCurrentUser(req, res) {
  try {
    res.set(
  'Cache-Control',
  'no-store'
)
    const userId = req.user.id

    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          mobile,
          role,
          email_verified,
          mobile_verified,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
      )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'User not found.',
      })
    }

    const user = users[0]

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        emailVerified:
          Boolean(
            user.email_verified
          ),
        mobileVerified:
          Boolean(
            user.mobile_verified
          ),
        createdAt:
          user.created_at,
        updatedAt:
          user.updated_at,
      },
    })

  } catch (error) {
    console.error(
      'Get Current User Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Internal server error.',
    })
  }
}