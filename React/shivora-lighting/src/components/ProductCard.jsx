import { formatCurrency } from '../utils/currency'

import {
  FiShoppingCart,
  FiHeart,
} from 'react-icons/fi'

function ProductCard({
  product,
  currency = 'INR',
  onAddToCart,
  onViewProduct,
  onToggleWishlist,
  isWishlisted,
}) {
  return (
    <article className="product-card">

      {/* =================================
          PRODUCT IMAGE
      ================================= */}
      <div
        className="product-image"
        onClick={() =>
          onViewProduct(product)
        }
      >

        {/* BADGE */}
        <span className="product-badge">
          {product.badge}
        </span>

        {/* WISHLIST */}
        <button
          className={`wishlist-button ${
            isWishlisted
              ? 'wishlisted'
              : ''
          }`}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          type="button"
          onClick={(event) => {
            event.stopPropagation()

            onToggleWishlist(product)
          }}
        >

          <FiHeart />

        </button>

        {/* REAL PRODUCT IMAGE */}
        <img
          src={product.image}
          alt={product.name}
          className="product-real-image"
        />

      </div>

      {/* =================================
          PRODUCT INFORMATION
      ================================= */}
      <div className="product-info">

        {/* CATEGORY */}
        <p className="product-category">
          {product.category}
        </p>

        {/* PRODUCT NAME */}
        <h3
          className="product-name-link"
          onClick={() =>
            onViewProduct(product)
          }
        >
          {product.name}
        </h3>

        {/* BOTTOM */}
        <div className="product-bottom">

          {/* PRICE */}
          <div className="product-price">

            <span className="current-price">
              {formatCurrency(
                product.price,
                currency
              )}
            </span>

            {product.originalPrice && (

              <span className="original-price">
                {formatCurrency(
                  product.originalPrice,
                  currency
                )}
              </span>

            )}

          </div>

          {/* ADD TO CART */}
          <button
            className="add-cart-button"
            aria-label={`Add ${product.name} to cart`}
            type="button"
            onClick={() =>
              onAddToCart(product)
            }
          >

            <FiShoppingCart />

          </button>

        </div>

      </div>

    </article>
  )
}

export default ProductCard