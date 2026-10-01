import { useEffect, useState } from 'react'

import {
  FiArrowLeft,
  FiSave,
  FiPackage,
  FiInfo,
  FiImage,
} from 'react-icons/fi'

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
}

function formatDateTime(value) {

  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AdminProductForm({
  product,
  currency = 'INR',
  onBack,
  onSave,
}) {
  const isEditMode = Boolean(product)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    is_active: '1',
    badge: 'NEW',
    description: '',
    wattage: '',
    color: '',
    material: '',
    image: '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price ?? '',
        originalPrice:
          product.originalPrice ?? '',
        stock: product.stock ?? '',
        is_active:
          Number(product.is_active) === 1
            ? '1'
            : '0',
        badge: product.badge || 'NEW',
        description:
          product.description || '',
        wattage: product.wattage || '',
        color: product.color || '',
        material: product.material || '',
        image: product.image || '',
      })
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        stock: '',
        is_active: '1',
        badge: 'NEW',
        description: '',
        wattage: '',
        color: '',
        material: '',
        image: '',
      })
    }

    setError('')
  }, [product])

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (
      !formData.name.trim() ||
      !formData.category.trim()
    ) {
      setError(
        'Product name and category are required.'
      )
      return
    }

    if (
      formData.price === '' ||
      Number(formData.price) < 0
    ) {
      setError(
        'Please enter a valid selling price.'
      )
      return
    }

    if (
      formData.stock === '' ||
      Number(formData.stock) < 0
    ) {
      setError(
        'Please enter a valid stock quantity.'
      )
      return
    }

    if (
      formData.originalPrice !== '' &&
      Number(formData.originalPrice) < 0
    ) {
      setError(
        'Original price cannot be negative.'
      )
      return
    }

    setSaving(true)

    try {
      await onSave({
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        originalPrice:
          formData.originalPrice === ''
            ? null
            : Number(formData.originalPrice),
        stock: Number(formData.stock),
        is_active:
          Number(formData.is_active),
        badge: formData.badge,
        description:
          formData.description.trim(),
        wattage: formData.wattage.trim(),
        color: formData.color.trim(),
        material: formData.material.trim(),
        image: formData.image.trim(),
      })
    } catch (err) {
      setError(
        err.message ||
          'Unable to save product.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-product-form-section">
      <div className="admin-product-form-container">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="admin-product-form-header">
          <div>
            <p className="section-eyebrow">
              CATALOG MANAGEMENT
            </p>

            <h1>
              {isEditMode
                ? 'Edit Product'
                : 'Add Product'}
            </h1>

            <p>
              {isEditMode
                ? 'Update the selected product.'
                : 'Add a new product to your catalog.'}
            </p>
          </div>

          <button
            type="button"
            className="admin-form-close-button"
            onClick={onBack}
            disabled={saving}
          >
            <FiArrowLeft />
            Products
          </button>
        </div>

        {error && (
          <div className="admin-form-error">
            {error}
          </div>
        )}

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >

          {/* =========================================
              PRODUCT INFORMATION
          ========================================= */}

          <div className="admin-form-card">

            <div className="admin-form-card-header">
              <FiPackage />

              <div>
                <h2>Product Information</h2>

                <p>
                  Basic details used across the
                  Shivora Lighting store.
                </p>
              </div>
            </div>

            <div className="admin-form-grid">

              <div className="admin-form-field">
                <label htmlFor="name">
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Aurora Ceiling Light"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="category">
                  Category
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ceiling Lights"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="price">
                  Selling Price
                </label>

                <div className="admin-input-prefix">
                  <span>{CURRENCY_SYMBOLS[currency] || '₹'}</span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="1999"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label htmlFor="originalPrice">
                  Original Price
                </label>

                <div className="admin-input-prefix">
                  <span>{CURRENCY_SYMBOLS[currency] || '₹'}</span>

                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="2499"
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label htmlFor="stock">
                  Stock
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  required
                />

                <small>
                  Set to 0 when the product is
                  currently out of stock.
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="is_active">
                  Product Status
                </label>

                <select
                  id="is_active"
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                >
                  <option value="1">
                    Active
                  </option>

                  <option value="0">
                    Inactive
                  </option>
                </select>

                <small>
                  Inactive products remain in the
                  database but are hidden from the
                  customer storefront.
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="badge">
                  Badge
                </label>

                <select
                  id="badge"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                >
                  <option value="NEW">
                    NEW
                  </option>

                  <option value="POPULAR">
                    POPULAR
                  </option>

                  <option value="SALE">
                    SALE
                  </option>
                </select>
              </div>

              <div className="admin-form-field">
                <label htmlFor="wattage">
                  Wattage
                </label>

                <input
                  id="wattage"
                  name="wattage"
                  type="text"
                  value={formData.wattage}
                  onChange={handleChange}
                  placeholder="24W"
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="color">
                  Light Color
                </label>

                <input
                  id="color"
                  name="color"
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Warm White"
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="material">
                  Material
                </label>

                <input
                  id="material"
                  name="material"
                  type="text"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="Aluminium"
                />
              </div>

              <div className="admin-form-field admin-form-field-full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description..."
                  rows="5"
                />
              </div>

            </div>
          </div>


          {/* =========================================
              IMAGE
          ========================================= */}

          <div className="admin-form-card">

            <div className="admin-form-card-header">
              <FiImage />

              <div>
                <h2>Product Image</h2>

                <p>
                  Use the public image URL served
                  by the Shivora backend.
                </p>
              </div>
            </div>

            <div className="admin-form-grid">

              <div className="admin-form-field admin-form-field-full">
                <label htmlFor="image">
                  Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="http://localhost:5000/products/nova-table.jpg"
                />

                {formData.image && (
                  <div className="admin-image-preview">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />

                    <span>
                      Image preview
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>


          {/* =========================================
              SYSTEM INFORMATION
          ========================================= */}

          {isEditMode && (
            <div className="admin-form-card">

              <div className="admin-form-card-header">
                <FiInfo />

                <div>
                  <h2>Product Information</h2>

                  <p>
                    System-generated details. These
                    values cannot be edited.
                  </p>
                </div>
              </div>

              <div className="admin-form-grid">

                <div className="admin-form-field">
                  <label htmlFor="product-id">
                    Product ID
                  </label>

                  <input
                    id="product-id"
                    type="text"
                    value={product.id ?? ''}
                    readOnly
                    disabled
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="created-at">
                    Created At
                  </label>

                  <input
                    id="created-at"
                    type="text"
                    value={formatDateTime(
                      product.created_at
                    )}
                    readOnly
                    disabled
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="updated-at">
                    Last Updated
                  </label>

                  <input
                    id="updated-at"
                    type="text"
                    value={formatDateTime(
                      product.updated_at
                    )}
                    readOnly
                    disabled
                  />
                </div>

              </div>
            </div>
          )}


          {/* =========================================
              ACTIONS
          ========================================= */}

          <div className="admin-product-form-actions">

            <button
              type="button"
              className="admin-form-cancel-button"
              onClick={onBack}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-form-save-button"
              disabled={saving}
            >
              <FiSave />

              {saving
                ? 'Saving...'
                : isEditMode
                  ? 'Update Product'
                  : 'Save Product'}
            </button>

          </div>

        </form>
      </div>
    </section>
  )
}

export default AdminProductForm
