const { pool } = require('../config/db')

const ADMIN_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

// ========================================
// CREATE ORDER
// CUSTOMER
// ========================================

async function createOrder(req, res) {
  let connection

  try {
    connection = await pool.getConnection()

    const userId = req.user.id
    const { items } = req.body

    // ------------------------------------
    // VALIDATE ITEMS
    // ------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'At least one product is required to place an order.',
      })
    }

    await connection.beginTransaction()

    let totalAmount = 0
    const orderItems = []

    // ------------------------------------
    // VALIDATE PRODUCTS + STOCK
    // ------------------------------------

    for (const item of items) {
      const productId = Number(item.productId)
      const quantity = Number(item.quantity)

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        throw new Error(
          'Invalid product ID.'
        )
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          'Invalid product quantity.'
        )
      }

      const [products] =
        await connection.execute(
          `
          SELECT
            id,
            name,
            price,
            stock,
            is_active
          FROM products
          WHERE id = ?
          FOR UPDATE
          `,
          [productId]
        )

      if (products.length === 0) {
        throw new Error(
          'Product not found.'
        )
      }

      const product = products[0]

      // ----------------------------------
      // ACTIVE PRODUCT CHECK
      // ----------------------------------

      if (!product.is_active) {
        throw new Error(
          `Product "${product.name}" is currently inactive.`
        )
      }

      // ----------------------------------
      // STOCK CHECK
      // ----------------------------------

      if (
        Number(product.stock) <
        quantity
      ) {
        throw new Error(
          `Insufficient stock for "${product.name}".`
        )
      }

      const price =
        Number(product.price)

      const subtotal =
        price * quantity

      totalAmount += subtotal

      orderItems.push({
        productId:
          product.id,

        productName:
          product.name,

        quantity,

        price,

        subtotal,
      })
    }

    // ------------------------------------
    // CREATE ORDER
    // ------------------------------------

    const [orderResult] =
      await connection.execute(
        `
        INSERT INTO orders (
          user_id,
          total_amount,
          status
        )
        VALUES (
          ?,
          ?,
          'PENDING'
        )
        `,
        [
          userId,
          totalAmount,
        ]
      )

    const orderId =
      orderResult.insertId

    // ------------------------------------
    // CREATE ORDER ITEMS
    // ------------------------------------

    for (const item of orderItems) {

      await connection.execute(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          price,
          subtotal
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.price,
          item.subtotal,
        ]
      )

      // ----------------------------------
      // REDUCE PRODUCT STOCK
      // ----------------------------------

      await connection.execute(
        `
        UPDATE products
        SET
          stock = stock - ?
        WHERE id = ?
        `,
        [
          item.quantity,
          item.productId,
        ]
      )
    }

    // ------------------------------------
    // COMMIT TRANSACTION
    // ------------------------------------

    await connection.commit()

    return res.status(201).json({
      success: true,

      message:
        'Order created successfully.',

      order: {
        id: orderId,

        userId,

        totalAmount,

        status:
          'PENDING',

        items:
          orderItems,
      },
    })
  } catch (error) {

    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Order Rollback Error:',
          rollbackError
        )
      }
    }

    console.error(
      'Create Order Error:',
      error
    )

    return res.status(400).json({
      success: false,

      message:
        error.message ||
        'Failed to create order.',
    })
  } finally {

    if (connection) {
      connection.release()
    }
  }
}

// ========================================
// GET MY ORDERS
// CUSTOMER
// ========================================

async function getMyOrders(
  req,
  res
) {
  try {

    const userId =
      req.user.id

    const [orders] =
      await pool.execute(
        `
        SELECT
          id,
          total_amount,
          status,
          created_at,
          updated_at
        FROM orders
        WHERE user_id = ?
        ORDER BY
          created_at DESC,
          id DESC
        `,
        [userId]
      )

    return res.status(200).json({
      success: true,
      orders,
    })

  } catch (error) {

    console.error(
      'Get My Orders Error:',
      error
    )

    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch your orders.',
    })
  }
}

// ========================================
// GET ORDER DETAILS
// CUSTOMER - OWN ORDER ONLY
// ========================================

async function getOrderDetails(
  req,
  res
) {
  try {

    const userId =
      req.user.id

    const orderId =
      Number(req.params.id)

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid order ID.',
      })
    }

    // ------------------------------------
    // GET ORDER
    // ------------------------------------

    const [orders] =
      await pool.execute(
        `
        SELECT
          id,
          user_id,
          total_amount,
          status,
          created_at,
          updated_at
        FROM orders
        WHERE
          id = ?
          AND user_id = ?
        LIMIT 1
        `,
        [
          orderId,
          userId,
        ]
      )

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,

        message:
          'Order not found.',
      })
    }

    // ------------------------------------
    // GET ORDER ITEMS
    // ------------------------------------

    const [items] =
      await pool.execute(
        `
        SELECT
          id,
          product_id,
          product_name,
          quantity,
          price,
          subtotal
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
        `,
        [orderId]
      )

    return res.status(200).json({
      success: true,

      order: {
        ...orders[0],

        items,
      },
    })

  } catch (error) {

    console.error(
      'Get Order Details Error:',
      error
    )

    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch order details.',
    })
  }
}

// ========================================
// GET ALL ORDERS
// ADMIN ONLY
// ========================================

async function getAdminOrders(
  req,
  res
) {
  try {

    const [orders] =
      await pool.execute(
        `
        SELECT
          o.id,
          o.user_id,
          o.total_amount,
          o.status,
          o.created_at,
          o.updated_at,

          u.id AS customer_id,
          u.name AS customer_name,
          u.email AS customer_email,
          u.mobile AS customer_mobile,
          u.account_status
            AS customer_account_status,

          (
            SELECT
              COUNT(*)
            FROM order_items oi_count
            WHERE
              oi_count.order_id =
                o.id
          ) AS item_count

        FROM orders o

        LEFT JOIN users u
          ON u.id = o.user_id

        ORDER BY
          o.created_at DESC,
          o.id DESC
        `
      )

    const formattedOrders =
      orders.map(
        (order) => ({
          id:
            order.id,

          user_id:
            order.user_id,

          total_amount:
            Number(
              order.total_amount
            ),

          status:
            order.status,

          created_at:
            order.created_at,

          updated_at:
            order.updated_at,

          itemCount:
            Number(
              order.item_count ||
              0
            ),

          customer: {
            id:
              order.customer_id,

            name:
              order.customer_name,

            email:
              order.customer_email,

            mobile:
              order.customer_mobile,

            accountStatus:
              order.customer_account_status,
          },
        })
      )

    return res.status(200).json({
      success: true,

      orders:
        formattedOrders,
    })

  } catch (error) {

    console.error(
      'Get Admin Orders Error:',
      error
    )

    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch admin orders.',
    })
  }
}

// ========================================
// GET ADMIN ORDER DETAILS
// ADMIN ONLY
// ========================================

async function getAdminOrderDetails(
  req,
  res
) {
  try {

    const orderId =
      Number(req.params.id)

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid order ID.',
      })
    }

    // ------------------------------------
    // GET ORDER + CUSTOMER
    // ------------------------------------

    const [orders] =
      await pool.execute(
        `
        SELECT
          o.id,
          o.user_id,
          o.total_amount,
          o.status,
          o.created_at,
          o.updated_at,

          u.id AS customer_id,
          u.name AS customer_name,
          u.email AS customer_email,
          u.mobile AS customer_mobile,
          u.account_status
            AS customer_account_status

        FROM orders o

        LEFT JOIN users u
          ON u.id = o.user_id

        WHERE o.id = ?

        LIMIT 1
        `,
        [orderId]
      )

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,

        message:
          'Order not found.',
      })
    }

    // ------------------------------------
    // GET ORDER ITEMS
    // ------------------------------------

    const [items] =
      await pool.execute(
        `
        SELECT
          id,
          product_id,
          product_name,
          quantity,
          price,
          subtotal
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
        `,
        [orderId]
      )

    const order =
      orders[0]

    return res.status(200).json({
      success: true,

      order: {

        id:
          order.id,

        user_id:
          order.user_id,

        total_amount:
          Number(
            order.total_amount
          ),

        status:
          order.status,

        created_at:
          order.created_at,

        updated_at:
          order.updated_at,

        itemCount:
          items.length,

        customer: {

          id:
            order.customer_id,

          name:
            order.customer_name,

          email:
            order.customer_email,

          mobile:
            order.customer_mobile,

          accountStatus:
            order.customer_account_status,
        },

        items,
      },
    })

  } catch (error) {

    console.error(
      'Get Admin Order Details Error:',
      error
    )

    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch admin order details.',
    })
  }
}

// ========================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ========================================

async function updateOrderStatus(
  req,
  res
) {
  try {

    const orderId =
      Number(req.params.id)

    const {
      status,
    } = req.body

    // ------------------------------------
    // VALIDATE ORDER ID
    // ------------------------------------

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid order ID.',
      })
    }

    // ------------------------------------
    // VALIDATE STATUS
    // ------------------------------------

    if (
      !ADMIN_ORDER_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          `Invalid order status. Allowed values: ${ADMIN_ORDER_STATUSES.join(', ')}.`,
      })
    }

    // ------------------------------------
    // CHECK ORDER
    // ------------------------------------

    const [
      existingOrders,
    ] = await pool.execute(
      `
      SELECT
        id
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [orderId]
    )

    if (
      existingOrders.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          'Order not found.',
      })
    }

    // ------------------------------------
    // UPDATE STATUS
    // ------------------------------------

    await pool.execute(
      `
      UPDATE orders
      SET
        status = ?,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        status,
        orderId,
      ]
    )

    return res.status(200).json({
      success: true,

      message:
        'Order status updated successfully.',

      order: {
        id:
          orderId,

        status,
      },
    })

  } catch (error) {

    console.error(
      'Update Order Status Error:',
      error
    )

    return res.status(500).json({
      success: false,

      message:
        'Failed to update order status.',
    })
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getAdminOrders,
  getAdminOrderDetails,
  updateOrderStatus,
}