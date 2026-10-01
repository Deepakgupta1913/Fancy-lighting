const { pool } = require('../config/db')

function formatCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    mobile: customer.mobile,
    role: customer.role,
    accountStatus: customer.account_status,
    emailVerified: Boolean(customer.email_verified),
    mobileVerified: Boolean(customer.mobile_verified),
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
  }
}

// =========================================
// GET ALL CUSTOMERS
// =========================================

async function getCustomers(req, res) {
  try {
    const [customers] = await pool.execute(
      `
        SELECT
          id,
          name,
          email,
          mobile,
          role,
          account_status,
          email_verified,
          mobile_verified,
          created_at,
          updated_at
        FROM users
        WHERE role = 'CUSTOMER'
        ORDER BY created_at DESC
      `
    )

    const formattedCustomers =
      customers.map(formatCustomer)

    return res.status(200).json({
      success: true,
      customers: formattedCustomers,
      count: formattedCustomers.length,
    })
  } catch (error) {
    console.error('Get Customers Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch customers.',
    })
  }
}

// =========================================
// GET CUSTOMER BY ID
// ADMIN ONLY
// =========================================

async function getCustomerById(req, res) {
  try {
    const customerId = Number(req.params.id)

    if (
      !customerId ||
      Number.isNaN(customerId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid customer ID is required.',
      })
    }

    const [customers] = await pool.execute(
      `
        SELECT
          id,
          name,
          email,
          mobile,
          role,
          account_status,
          email_verified,
          mobile_verified,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
          AND role = 'CUSTOMER'
        LIMIT 1
      `,
      [customerId]
    )

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      })
    }

    return res.status(200).json({
      success: true,
      customer: formatCustomer(customers[0]),
    })
  } catch (error) {
    console.error(
      'Get Customer Details Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch customer details.',
    })
  }
}

// =========================================
// UPDATE CUSTOMER ACCOUNT STATUS
// =========================================

async function updateCustomerStatus(req, res) {
  try {
    const customerId = Number(req.params.id)
    const { accountStatus } = req.body

    if (
      !customerId ||
      Number.isNaN(customerId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid customer ID is required.',
      })
    }

    if (
      !['ACTIVE', 'BLOCKED'].includes(
        accountStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Account status must be ACTIVE or BLOCKED.',
      })
    }

    const [customers] = await pool.execute(
      `
        SELECT
          id,
          name,
          role,
          account_status
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [customerId]
    )

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      })
    }

    const customer = customers[0]

    if (customer.role !== 'CUSTOMER') {
      return res.status(403).json({
        success: false,
        message:
          'Only customer accounts can be blocked or unblocked.',
      })
    }

    await pool.execute(
      `
        UPDATE users
        SET account_status = ?
        WHERE id = ?
      `,
      [accountStatus, customerId]
    )

    return res.status(200).json({
      success: true,
      message:
        `Customer account status changed to ${accountStatus}.`,
      customer: {
        id: customer.id,
        name: customer.name,
        accountStatus,
      },
    })
  } catch (error) {
    console.error(
      'Update Customer Status Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to update customer account status.',
    })
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
}
