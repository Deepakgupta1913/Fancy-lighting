const { pool } = require('../config/db')

// ========================================
// FORMAT PRODUCT
// ========================================

function formatProduct(product) {
  return {
    id: product.id,

    name: product.name,

    category: product.category,

    price: Number(product.price),

    original_price:
      product.original_price !== null
        ? Number(product.original_price)
        : null,

    badge: product.badge,

    image: product.image,

    stock: Number(product.stock || 0),

    description: product.description,

    wattage: product.wattage,

    color: product.color,

    material: product.material,

    // IMPORTANT:
    // Frontend is using is_active
    is_active: Number(product.is_active) === 1,

    created_at: product.created_at,

    updated_at: product.updated_at,
  }
}


// ========================================
// GET ACTIVE PRODUCTS
// PUBLIC
// ========================================

async function getProducts(req, res) {
  try {
    const [products] = await pool.execute(`
      SELECT
        id,
        name,
        category,
        price,
        original_price,
        badge,
        image,
        stock,
        description,
        wattage,
        color,
        material,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE is_active = TRUE
      ORDER BY id DESC
    `)

    const formattedProducts =
      products.map(formatProduct)

    return res.status(200).json({
      success: true,
      products: formattedProducts,
    })

  } catch (error) {
    console.error(
      'Get Products Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
    })
  }
}


// ========================================
// GET ALL PRODUCTS
// ADMIN
// ========================================

async function getAdminProducts(req, res) {
  try {
    const [products] = await pool.execute(`
      SELECT
        id,
        name,
        category,
        price,
        original_price,
        badge,
        image,
        stock,
        description,
        wattage,
        color,
        material,
        is_active,
        created_at,
        updated_at
      FROM products
      ORDER BY id DESC
    `)

    const formattedProducts =
      products.map(formatProduct)

    return res.status(200).json({
      success: true,
      products: formattedProducts,
    })

  } catch (error) {
    console.error(
      'Get Admin Products Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch admin products.',
    })
  }
}


// ========================================
// CREATE PRODUCT
// ADMIN ONLY
// ========================================

async function createProduct(req, res) {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      badge,
      image,
      stock,
      description,
      wattage,
      color,
      material,

      // New frontend field
      is_active,

      // Old field kept for compatibility
      status,
    } = req.body


    // ======================================
    // REQUIRED VALIDATION
    // ======================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      })
    }

    if (
      price === undefined ||
      price === null ||
      price === '' ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid product price is required.',
      })
    }

    if (
      stock === undefined ||
      stock === null ||
      stock === '' ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid stock quantity is required.',
      })
    }


    // ======================================
    // DUPLICATE CHECK
    // ======================================

    const [duplicateProducts] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          category
        FROM products
        WHERE
          LOWER(TRIM(name)) =
            LOWER(TRIM(?))
          AND
          LOWER(TRIM(category)) =
            LOWER(TRIM(?))
        LIMIT 1
        `,
        [
          name.trim(),
          category.trim(),
        ]
      )


    if (duplicateProducts.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'A product with the same name and category already exists.',
        product:
          duplicateProducts[0],
      })
    }


    // ======================================
    // STATUS
    // ======================================

    let activeValue = 1

    if (is_active !== undefined) {
      activeValue =
        Number(is_active) === 1
          ? 1
          : 0
    } else if (status !== undefined) {
      activeValue =
        status === 'INACTIVE'
          ? 0
          : 1
    }


    // ======================================
    // INSERT PRODUCT
    // ======================================

    const [result] =
      await pool.execute(
        `
        INSERT INTO products (
          name,
          category,
          price,
          original_price,
          badge,
          image,
          stock,
          description,
          wattage,
          color,
          material,
          is_active
        )
        VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
        `,
        [
          name.trim(),

          category.trim(),

          Number(price),

          originalPrice === null ||
          originalPrice === undefined ||
          originalPrice === ''
            ? null
            : Number(originalPrice),

          badge
            ? badge.trim()
            : null,

          image
            ? image.trim()
            : null,

          Number(stock),

          description
            ? description.trim()
            : null,

          wattage
            ? wattage.trim()
            : null,

          color
            ? color.trim()
            : null,

          material
            ? material.trim()
            : null,

          activeValue,
        ]
      )


    // ======================================
    // GET CREATED PRODUCT
    // ======================================

    const [products] =
      await pool.execute(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
      )


    return res.status(201).json({
      success: true,

      message:
        'Product created successfully.',

      product:
        formatProduct(
          products[0]
        ),
    })

  } catch (error) {
    console.error(
      'Create Product Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to create product.',
    })
  }
}


// ========================================
// UPDATE PRODUCT
// ADMIN ONLY
// ========================================

async function updateProduct(req, res) {
  try {
    const { id } = req.params

    const {
      name,
      category,
      price,
      originalPrice,
      badge,
      image,
      stock,
      description,
      wattage,
      color,
      material,

      // IMPORTANT
      // React form sends this
      is_active,

      // Old field compatibility
      status,
    } = req.body


    // ======================================
    // FIND PRODUCT
    // ======================================

    const [existingProducts] =
      await pool.execute(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      )


    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }


    // ======================================
    // REQUIRED VALIDATION
    // ======================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      })
    }

    if (
      price === undefined ||
      price === null ||
      price === '' ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid product price is required.',
      })
    }

    if (
      stock === undefined ||
      stock === null ||
      stock === '' ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid stock quantity is required.',
      })
    }


    // ======================================
    // DUPLICATE CHECK
    // ======================================

    const [duplicateProducts] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          category
        FROM products
        WHERE
          id <> ?
          AND
          LOWER(TRIM(name)) =
            LOWER(TRIM(?))
          AND
          LOWER(TRIM(category)) =
            LOWER(TRIM(?))
        LIMIT 1
        `,
        [
          id,
          name.trim(),
          category.trim(),
        ]
      )


    if (duplicateProducts.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'Another product with the same name and category already exists.',
        product:
          duplicateProducts[0],
      })
    }


    // ======================================
    // STATUS
    // ======================================

    let activeValue

    if (is_active !== undefined) {
      activeValue =
        Number(is_active) === 1
          ? 1
          : 0
    } else if (status !== undefined) {
      activeValue =
        status === 'INACTIVE'
          ? 0
          : 1
    } else {
      // If status was not supplied,
      // keep existing database value.
      activeValue =
        Number(
          existingProducts[0].is_active
        ) === 1
          ? 1
          : 0
    }


    console.log(
      'Updating product:',
      id
    )

    console.log(
      'Received is_active:',
      is_active
    )

    console.log(
      'Final activeValue:',
      activeValue
    )


    // ======================================
    // UPDATE SAME ROW
    // ======================================

    await pool.execute(
      `
      UPDATE products
      SET
        name = ?,
        category = ?,
        price = ?,
        original_price = ?,
        badge = ?,
        image = ?,
        stock = ?,
        description = ?,
        wattage = ?,
        color = ?,
        material = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        name.trim(),

        category.trim(),

        Number(price),

        originalPrice === null ||
        originalPrice === undefined ||
        originalPrice === ''
          ? null
          : Number(originalPrice),

        badge
          ? badge.trim()
          : null,

        image
          ? image.trim()
          : null,

        Number(stock),

        description
          ? description.trim()
          : null,

        wattage
          ? wattage.trim()
          : null,

        color
          ? color.trim()
          : null,

        material
          ? material.trim()
          : null,

        activeValue,

        id,
      ]
    )


    // ======================================
    // GET UPDATED PRODUCT
    // ======================================

    const [products] =
      await pool.execute(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      )


    return res.status(200).json({
      success: true,

      message:
        'Product updated successfully.',

      product:
        formatProduct(
          products[0]
        ),
    })

  } catch (error) {
    console.error(
      'Update Product Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to update product.',
    })
  }
}


// ========================================
// DELETE PRODUCT
// ADMIN ONLY
// ========================================
//
// Soft delete
// is_active = FALSE
//
// Actual database row delete nahi hogi.
// ========================================

async function deleteProduct(req, res) {
  try {
    const { id } = req.params


    const [existingProducts] =
      await pool.execute(
        `
        SELECT id
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      )


    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }


    await pool.execute(
      `
      UPDATE products
      SET
        is_active = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    )


    return res.status(200).json({
      success: true,
      message:
        'Product deleted successfully.',
    })

  } catch (error) {
    console.error(
      'Delete Product Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to delete product.',
    })
  }
}


// ========================================
// EXPORTS
// ========================================

module.exports = {
  getProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}