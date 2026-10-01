const { pool } = require('../config/db')

const DEFAULT_SETTINGS = {
  storeName: 'Shivora Lighting',
  email: 'admin@shivora.com',
  mobile: '9999999999',
  currency: 'INR',
  theme: 'Slate & Pearl',
  storeStatus: 'Open',
}

const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']
const ALLOWED_THEMES = [
  'Slate & Pearl',
  'Midnight Luxe',
  'Sage Modern',
  'Warm Minimal',
]
const ALLOWED_STATUSES = ['Open', 'Maintenance']

async function ensureSettingsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      store_name VARCHAR(120) NOT NULL,
      store_email VARCHAR(190) NOT NULL,
      store_mobile VARCHAR(30) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      theme VARCHAR(50) NOT NULL DEFAULT 'Slate & Pearl',
      store_status VARCHAR(20) NOT NULL DEFAULT 'Open',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(
    `
      INSERT IGNORE INTO store_settings
      (id, store_name, store_email, store_mobile, currency, theme, store_status)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `,
    [
      DEFAULT_SETTINGS.storeName,
      DEFAULT_SETTINGS.email,
      DEFAULT_SETTINGS.mobile,
      DEFAULT_SETTINGS.currency,
      DEFAULT_SETTINGS.theme,
      DEFAULT_SETTINGS.storeStatus,
    ]
  )
}

function formatSettings(row) {
  return {
    storeName: row.store_name,
    email: row.store_email,
    mobile: row.store_mobile,
    currency: row.currency,
    theme: row.theme,
    storeStatus: row.store_status,
    updatedAt: row.updated_at,
  }
}

// GET /api/settings
// Public because the storefront needs these values to render.
async function getStoreSettings(req, res) {
  try {
    await ensureSettingsTable()

    const [rows] = await pool.execute(
      `
        SELECT
          store_name,
          store_email,
          store_mobile,
          currency,
          theme,
          store_status,
          updated_at
        FROM store_settings
        WHERE id = 1
        LIMIT 1
      `
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store settings not found.',
      })
    }

    return res.status(200).json({
      success: true,
      settings: formatSettings(rows[0]),
    })
  } catch (error) {
    console.error('Get Store Settings Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load store settings.',
    })
  }
}

// PUT /api/settings
// Admin only.
async function updateStoreSettings(req, res) {
  try {
    const {
      storeName,
      email,
      mobile,
      currency,
      theme,
      storeStatus,
    } = req.body

    const cleanName = String(storeName || '').trim()
    const cleanEmail = String(email || '').trim().toLowerCase()
    const cleanMobile = String(mobile || '').trim()

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Store name is required.',
      })
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid store email.',
      })
    }

    if (!/^\+?[0-9][0-9\s-]{7,19}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid store mobile number.',
      })
    }

    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency selected.',
      })
    }

    if (!ALLOWED_THEMES.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store theme selected.',
      })
    }

    if (!ALLOWED_STATUSES.includes(storeStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store status selected.',
      })
    }

    await ensureSettingsTable()

    await pool.execute(
      `
        UPDATE store_settings
        SET
          store_name = ?,
          store_email = ?,
          store_mobile = ?,
          currency = ?,
          theme = ?,
          store_status = ?
        WHERE id = 1
      `,
      [
        cleanName,
        cleanEmail,
        cleanMobile,
        currency,
        theme,
        storeStatus,
      ]
    )

    const [rows] = await pool.execute(
      `
        SELECT
          store_name,
          store_email,
          store_mobile,
          currency,
          theme,
          store_status,
          updated_at
        FROM store_settings
        WHERE id = 1
        LIMIT 1
      `
    )

    return res.status(200).json({
      success: true,
      message: 'Store settings updated successfully.',
      settings: formatSettings(rows[0]),
    })
  } catch (error) {
    console.error('Update Store Settings Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update store settings.',
    })
  }
}

module.exports = {
  ensureSettingsTable,
  getStoreSettings,
  updateStoreSettings,
}
