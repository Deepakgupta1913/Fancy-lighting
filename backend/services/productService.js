const { pool } = require('../config/db')

async function getAllProducts() {
  const [products] = await pool.execute(
    `
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
    `
  )

  return products
}

async function getProductById(id) {
  const [products] = await pool.execute(
    `
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
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  )

  if (products.length === 0) {
    return null
  }

  return products[0]
}

async function createProduct(product) {
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
  } = product

  const [result] = await pool.execute(
    `
    INSERT INTO products
    (
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
      material
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      category,
      price,
      originalPrice || null,
      badge || null,
      image || null,
      stock || 0,
      description || null,
      wattage || null,
      color || null,
      material || null,
    ]
  )

  return getProductById(result.insertId)
}

async function updateProduct(id, product) {
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
  } = product

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
      material = ?
    WHERE id = ?
    `,
    [
      name,
      category,
      price,
      originalPrice || null,
      badge || null,
      image || null,
      stock || 0,
      description || null,
      wattage || null,
      color || null,
      material || null,
      id,
    ]
  )

  return getProductById(id)
}

async function deleteProduct(id) {
  const [result] = await pool.execute(
    `
    UPDATE products
    SET is_active = FALSE
    WHERE id = ?
    `,
    [id]
  )

  return result.affectedRows > 0
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}