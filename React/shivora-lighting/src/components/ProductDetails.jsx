import {
  FiArrowLeft,
  FiShoppingCart,
  FiMinus,
  FiPlus,
} from 'react-icons/fi'

import { useState } from 'react'

import { formatCurrency } from '../utils/currency'

function ProductDetails({
  product,
  currency = 'INR',
  onBack,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return null
  }

  const increaseQuantity = () => {
    setQuantity(
      (currentQuantity) =>
        currentQuantity + 1
    )
  }

  const decreaseQuantity = () => {
    setQuantity(
      (currentQuantity) =>
        Math.max(1, currentQuantity - 1)
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product)
    }

    onBack()
  }

  return (
    <section className="product-details-section">

      <div className="product-details-container">

        {/* BACK */}
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          <FiArrowLeft />
          Back to Products
        </button>

        <div className="product-details-grid">

          {/* IMAGE */}
          <div className="product-details-image">

            <span className="product-details-badge">
              {product.badge}
            </span>

            <img
              src={product.image}
              alt={product.name}
              className="product-details-real-image"
            />

          </div>

          {/* INFORMATION */}
          <div className="product-details-info">

            <p className="product-category">
              {product.category}
            </p>

            <h1>
              {product.name}
            </h1>

            <div className="details-price">

              <span>
                {formatCurrency(
                  product.price,
                  currency
                )}
              </span>

              {product.originalPrice && (
                <del>
                  {formatCurrency(
                    product.originalPrice,
                    currency
                  )}
                </del>
              )}

            </div>

            <p className="product-description">
              {product.description}
            </p>

            <div className="product-specifications">

              <div className="specification">
                <span>
                  Wattage
                </span>

                <strong>
                  {product.wattage}
                </strong>
              </div>

              <div className="specification">
                <span>
                  Light Color
                </span>

                <strong>
                  {product.color}
                </strong>
              </div>

              <div className="specification">
                <span>
                  Material
                </span>

                <strong>
                  {product.material}
                </strong>
              </div>

            </div>

            <div className="details-quantity">

              <span>
                Quantity
              </span>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                >
                  <FiMinus />
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                >
                  <FiPlus />
                </button>

              </div>

            </div>

            <button
              type="button"
              className="details-add-cart"
              onClick={handleAddToCart}
            >
              <FiShoppingCart />
              Add to Cart
            </button>

          </div>

        </div>

      </div>

    </section>
  )
}

export default ProductDetails