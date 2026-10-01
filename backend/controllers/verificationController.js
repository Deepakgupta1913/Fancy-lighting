const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const { pool } = require('../config/db')

// =========================================
// GENERATE 6 DIGIT OTP
// =========================================

function generateOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString()
}

// =========================================
// SEND OTP
// =========================================

async function sendVerificationOtp(
  req,
  res
) {
  try {
    const userId = req.user.id
    const {
      channel,
    } = req.body

    // =====================================
    // Validate Channel
    // =====================================

    if (
      channel !== 'EMAIL' &&
      channel !== 'MOBILE'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Channel must be EMAIL or MOBILE.',
      })
    }

    // =====================================
    // Get User
    // =====================================

    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          email,
          mobile,
          email_verified,
          mobile_verified
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

    // =====================================
    // Check Already Verified
    // =====================================

    if (
      channel === 'EMAIL' &&
      Boolean(user.email_verified)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Email is already verified.',
      })
    }

    if (
      channel === 'MOBILE' &&
      Boolean(user.mobile_verified)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Mobile number is already verified.',
      })
    }

    // =====================================
    // Generate OTP
    // =====================================

    const otp = generateOtp()

    // =====================================
    // Hash OTP
    // =====================================

    const otpHash =
      await bcrypt.hash(otp, 10)

    // =====================================
    // OTP Expiry
    // =====================================

    const expiresAt =
      new Date(
        Date.now() + 5 * 60 * 1000
      )

    // =====================================
    // Remove Previous Active OTP
    // =====================================

    await pool.execute(
      `
      DELETE FROM verification_otps
      WHERE user_id = ?
        AND channel = ?
        AND verified_at IS NULL
      `,
      [
        userId,
        channel,
      ]
    )

    // =====================================
    // Save OTP Hash
    // =====================================

    await pool.execute(
      `
      INSERT INTO verification_otps
      (
        user_id,
        channel,
        otp_hash,
        expires_at
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        channel,
        otpHash,
        expiresAt,
      ]
    )

    // =====================================
    // TEMPORARY DEVELOPMENT OUTPUT
    // =====================================
    //
    // IMPORTANT:
    // OTP is NOT returned in the API response.
    //
    // For development only, we print it
    // in the backend terminal.
    //
    // Later we will replace this with
    // actual Email/SMS delivery.
    // =====================================

    console.log(
      '================================='
    )

    console.log(
      `Verification OTP (${channel})`
    )

    console.log(
      'User ID:',
      userId
    )

    console.log(
      'OTP:',
      otp
    )

    console.log(
      'Expires:',
      expiresAt
    )

    console.log(
      '================================='
    )

    return res.status(200).json({
      success: true,
      message:
        `${channel} verification OTP generated successfully.`,
    })

  } catch (error) {

    console.error(
      'Send Verification OTP Error:',
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
// VERIFY OTP
// =========================================

async function verifyOtp(
  req,
  res
) {
  try {
    const userId = req.user.id

    const {
      channel,
      otp,
    } = req.body

    // =====================================
    // Validate Input
    // =====================================

    if (
      (
        channel !== 'EMAIL' &&
        channel !== 'MOBILE'
      ) ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Channel and OTP are required.',
      })
    }

    // =====================================
    // Find Latest OTP
    // =====================================

    const [otpRecords] =
      await pool.execute(
        `
        SELECT
          id,
          otp_hash,
          expires_at,
          attempts,
          verified_at
        FROM verification_otps
        WHERE user_id = ?
          AND channel = ?
          AND verified_at IS NULL
        ORDER BY id DESC
        LIMIT 1
        `,
        [
          userId,
          channel,
        ]
      )

    if (otpRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'No active OTP found. Please request a new OTP.',
      })
    }

    const otpRecord =
      otpRecords[0]

    // =====================================
    // Check Expiry
    // =====================================

    if (
      new Date() >
      new Date(otpRecord.expires_at)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'OTP has expired. Please request a new OTP.',
      })
    }

    // =====================================
    // Check Attempts
    // =====================================

    if (
      otpRecord.attempts >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          'Too many incorrect attempts. Please request a new OTP.',
      })
    }

    // =====================================
    // Compare OTP
    // =====================================

    const otpMatch =
      await bcrypt.compare(
        otp.toString(),
        otpRecord.otp_hash
      )

    if (!otpMatch) {

      await pool.execute(
        `
        UPDATE verification_otps
        SET attempts = attempts + 1
        WHERE id = ?
        `,
        [otpRecord.id]
      )

      return res.status(400).json({
        success: false,
        message:
          'Invalid OTP.',
      })
    }

    // =====================================
    // Mark OTP Verified
    // =====================================

    await pool.execute(
      `
      UPDATE verification_otps
      SET verified_at = NOW()
      WHERE id = ?
      `,
      [otpRecord.id]
    )

    // =====================================
    // Update User Verification Status
    // =====================================

    if (channel === 'EMAIL') {

      await pool.execute(
        `
        UPDATE users
        SET email_verified = TRUE
        WHERE id = ?
        `,
        [userId]
      )

    } else {

      await pool.execute(
        `
        UPDATE users
        SET mobile_verified = TRUE
        WHERE id = ?
        `,
        [userId]
      )
    }

    // =====================================
    // Success
    // =====================================

    return res.status(200).json({
      success: true,
      message:
        channel === 'EMAIL'
          ? 'Email verified successfully.'
          : 'Mobile number verified successfully.',
    })

  } catch (error) {

    console.error(
      'Verify OTP Error:',
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
  sendVerificationOtp,
  verifyOtp,
}