import { useEffect, useMemo, useState } from 'react'

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiArrowLeft,
  FiFilter,
  FiX,
} from 'react-icons/fi'

import AdminProductForm from './AdminProductForm'

import { formatCurrency } from '../utils/currency'

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

function AdminProducts({
  products = [],
  currency = 'INR',
  onBack,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) {
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const categories = useMemo(() => {
    const uniqueCategories = new Set()

    products.forEach((product) => {
      const category = String(product.category || '').trim()

      if (category) {
        uniqueCategories.add(category)
      }
    })

    return Array.from(uniqueCategories).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return products
    }

    return products.filter(
      (product) =>
        String(product.category || '').trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase()
    )
  }, [products, selectedCategory])

  useEffect(() => {
    if (
      selectedCategory !== 'ALL' &&
      !categories.some(
        (category) =>
          category.toLowerCase() === selectedCategory.toLowerCase()
      )
    ) {
      setSelectedCategory('ALL')
    }
  }, [categories, selectedCategory])

  const handleAdd = () => {
    setSelectedProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      await onDeleteProduct(product.id)
    } catch (error) {
      window.alert(error.message || 'Unable to delete product.')
    }
  }

  const handleSaveProduct = async (productData) => {
    if (selectedProduct) {
      await onUpdateProduct(selectedProduct.id, productData)
    } else {
      await onAddProduct(productData)
    }

    setShowForm(false)
    setSelectedProduct(null)
  }

  const clearCategoryFilter = () => {
    setSelectedCategory('ALL')
  }

  if (showForm) {
    return (
      <AdminProductForm
        product={selectedProduct}
        currency={currency}
        onBack={() => {
          setShowForm(false)
          setSelectedProduct(null)
        }}
        onSave={handleSaveProduct}
      />
    )
  }

  return (
    <section className="admin-products-section">
      <div className="admin-page-header">
        <div>
          <p className="section-eyebrow">CATALOG MANAGEMENT</p>

          <h1>Products</h1>

          <p>
            Manage your Shivora Lighting product catalog.
          </p>
        </div>

        <div className="admin-products-header-actions">
          <button
            type="button"
            className="admin-back-button"
            onClick={onBack}
          >
            <FiArrowLeft />
            Dashboard
          </button>

          <button
            type="button"
            className="admin-add-button"
            onClick={handleAdd}
          >
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      <div className="admin-product-filter-bar">
        <div className="admin-product-filter-left">
          <div className="admin-filter-label">
            <FiFilter />
            <span>Filter by Category</span>
          </div>

          <div className="admin-category-select-wrapper">
            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              aria-label="Filter products by category"
            >
              <option value="ALL">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-product-filter-result">
          <span>Showing</span>

          <strong>{filteredProducts.length}</strong>

          <span>of {products.length} products</span>

          {selectedCategory !== 'ALL' && (
            <button
              type="button"
              className="admin-clear-filter"
              onClick={clearCategoryFilter}
            >
              <FiX />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="admin-product-table-wrapper">
        <table className="admin-product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Qty</th>
              <th>Availability</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="admin-products-empty">
                  <FiPackage />

                  <strong>No products found</strong>

                  <span>
                    {selectedCategory === 'ALL'
                      ? 'Your product catalog is currently empty.'
                      : `No products found in "${selectedCategory}".`}
                  </span>

                  {selectedCategory !== 'ALL' && (
                    <button
                      type="button"
                      className="admin-clear-filter-empty"
                      onClick={clearCategoryFilter}
                    >
                      View All Products
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isActive = Number(product.is_active) === 1
                const stock = Number(product.stock || 0)

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-name">
                        <div className="admin-product-image">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <FiPackage />
                          )}
                        </div>

                        <div>
                          <strong>{product.name}</strong>

                          <span>ID: {product.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-category-value">
                        {product.category}
                      </span>
                    </td>

                    <td>
                      {formatCurrency(
                        product.price,
                        currency
                      )}
                    </td>

                    <td>
                      <div className="admin-stock-cell">
                        <strong>{stock}</strong>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          stock > 0 ? 'stock-active' : 'stock-out'
                        }
                      >
                        {stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          isActive
                            ? 'product-status-active'
                            : 'product-status-inactive'
                        }
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <span className="admin-product-date">
                        {formatDateTime(product.created_at)}
                      </span>
                    </td>

                    <td>
                      <span className="admin-product-date">
                        {formatDateTime(product.updated_at)}
                      </span>
                    </td>

                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() => handleEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          title={`Edit ${product.name}`}
                        >
                          <FiEdit2 />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => handleDelete(product)}
                          aria-label={`Delete ${product.name}`}
                          title={`Delete ${product.name}`}
                        >
                          <FiTrash2 />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminProducts
