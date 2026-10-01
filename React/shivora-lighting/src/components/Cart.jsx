import { useState } from 'react'

import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiCheckCircle,
  FiLock,
  FiX,
  FiShoppingBag,
  FiShield,
  FiArrowRight,
  FiUser,
  FiMail,
  FiPhone,
} from 'react-icons/fi'

import './CartPremium.css'

import { formatCurrency as formatStoreCurrency } from '../utils/currency'

const API_BASE_URL = 'http://localhost:5000/api'

function Cart({
  cart = [],
  setCart,
  user,
  currency = 'INR',
  onLogin,
}) {
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Number(item.quantity || 0) + 1 }
          : item
      )
    )
  }

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Number(item.quantity || 0) - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    )
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  )

  const cartQuantity = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  )

  const formatCurrency = (value) =>
    formatStoreCurrency(value, currency)

  const getImageUrl = (image) => {
    if (!image) return ''
    return image.startsWith('http')
      ? image
      : `http://localhost:5000${image}`
  }

  const handleCheckout = () => {
    setOrderMessage('')

    if (cart.length === 0) {
      setOrderMessage('Your cart is empty.')
      return
    }

    const token = localStorage.getItem('shivora_token')

    if (!token || !user) {
      setOrderMessage('Please login before checkout.')

      if (onLogin) {
        setTimeout(() => onLogin(), 500)
      }
      return
    }

    if (user.role && user.role !== 'CUSTOMER') {
      setOrderMessage('Only customer accounts can place orders.')
      return
    }

    setShowCheckout(true)
  }

  const handlePlaceOrder = async () => {
    setOrderMessage('')

    const token = localStorage.getItem('shivora_token')

    if (!token || !user) {
      setOrderMessage(
        'Your login session has expired. Please login again.'
      )
      return
    }

    if (cart.length === 0) {
      setOrderMessage('Your cart is empty.')
      return
    }

    try {
      setPlacingOrder(true)

      const items = cart.map((item) => ({
        productId: Number(item.id),
        quantity: Number(item.quantity),
      }))

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      })

      let data = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (response.status === 401) {
        setOrderMessage(
          'Your login session has expired. Please login again.'
        )
        return
      }

      if (response.status === 403) {
        setOrderMessage(
          data?.message ||
            'You are not allowed to place this order.'
        )
        return
      }

      if (!response.ok || !data?.success) {
        setOrderMessage(
          data?.message || 'Unable to place order.'
        )
        return
      }

      setCreatedOrder(data.order)
      setShowCheckout(false)
      setOrderSuccess(true)
      setOrderMessage(data.message || 'Order placed successfully.')
      setCart([])
    } catch (error) {
      console.error('Place Order Error:', error)
      setOrderMessage(
        'Unable to connect to the backend server. Make sure the backend is running on port 5000.'
      )
    } finally {
      setPlacingOrder(false)
    }
  }

  if (orderSuccess) {
    return (
      <section id="cart" className="cart-section cart-success-section">
        <div className="cart-container">
          <div className="order-success-card premium-order-success-card">
            <div className="order-success-icon">
              <FiCheckCircle />
            </div>

            <p className="section-eyebrow">SHIVORA LIGHTING</p>
            <h2>Order placed successfully</h2>
            <p className="order-success-copy">
              Your order has been securely recorded. We have saved the
              products, quantities and customer account against this order.
            </p>

            {createdOrder && (
              <div className="order-success-grid">
                <div className="order-success-stat">
                  <span>Order ID</span>
                  <strong>#{createdOrder.id}</strong>
                </div>
                <div className="order-success-stat">
                  <span>Total</span>
                  <strong>{formatCurrency(createdOrder.totalAmount)}</strong>
                </div>
                <div className="order-success-stat">
                  <span>Status</span>
                  <strong className="success-status-pill">
                    {createdOrder.status}
                  </strong>
                </div>
              </div>
            )}

            <button
              type="button"
              className="premium-primary-button premium-success-button"
              onClick={() => {
                setOrderSuccess(false)
                setCreatedOrder(null)
                setOrderMessage('')
              }}
            >
              Continue Shopping
              <FiArrowRight />
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="cart" className="cart-section">
      <div className="cart-container">
        <div className="cart-header cart-premium-header">
          <div>
            <p className="section-eyebrow">YOUR SHOPPING BAG</p>
            <h2>Shopping Cart</h2>
            <p>
              Review your lighting selections, adjust quantities, and continue
              to secure checkout.
            </p>
          </div>

          {cart.length > 0 && (
            <div className="cart-header-count">
              <span>{cartQuantity}</span>
              {cartQuantity === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>

        {orderMessage && !showCheckout && (
          <div className="cart-order-message cart-order-message-error">
            {orderMessage}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="empty-cart premium-empty-cart">
            <div className="empty-cart-icon">
              <FiShoppingBag />
            </div>
            <p className="section-eyebrow">NOTHING HERE YET</p>
            <h3>Your shopping cart is empty</h3>
            <p>
              Explore our lighting collection and add something beautiful to
              get started.
            </p>
            <a href="#products" className="premium-secondary-button">
              Browse Products
              <FiArrowRight />
            </a>
          </div>
        ) : (
          <div className="cart-layout cart-premium-layout">
            <div className="cart-items cart-premium-items">
              <div className="cart-list-heading">
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>

              {cart.map((item) => {
                const lineTotal =
                  Number(item.price || 0) * Number(item.quantity || 0)
                const imageUrl = getImageUrl(item.image)

                return (
                  <article className="cart-item premium-cart-item" key={item.id}>
                    <div className="cart-item-product">
                      <div className="cart-item-image premium-cart-item-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name || 'Product'}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : null}
                        <div className="cart-light-fallback">
                          <div className="cart-light-glow" />
                        </div>
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-product-category">
                          {item.category || 'LIGHTING'}
                        </span>
                        <h3>{item.name}</h3>
                        <p>{formatCurrency(item.price)} each</p>
                      </div>
                    </div>

                    <div className="cart-item-quantity">
                      <div className="quantity-control premium-quantity-control">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <FiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total premium-cart-item-total">
                      <strong>{formatCurrency(lineTotal)}</strong>
                      <button
                        type="button"
                        className="remove-button premium-remove-button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        title="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="cart-summary premium-cart-summary">
              <div className="summary-topline">
                <div>
                  <p className="section-eyebrow">CHECKOUT</p>
                  <h3>Order Summary</h3>
                </div>
                <div className="summary-bag-icon">
                  <FiShoppingBag />
                </div>
              </div>

              <div className="summary-row">
                <span>Items</span>
                <strong>{cartQuantity}</strong>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <strong className="free-delivery">Free</strong>
              </div>

              <div className="summary-divider" />

              <div className="summary-total premium-summary-total">
                <span>Total</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="checkout-trust-row">
                <FiShield />
                <span>Secure account-based order placement</span>
              </div>

              <button
                type="button"
                className="checkout-button premium-checkout-button"
                onClick={handleCheckout}
                disabled={placingOrder}
              >
                <FiLock />
                Proceed to Checkout
                <FiArrowRight className="checkout-arrow" />
              </button>

              <a href="#products" className="continue-shopping-link premium-continue-link">
                Continue Shopping
              </a>
            </aside>
          </div>
        )}

        {showCheckout && (
          <div
            className="checkout-modal-overlay premium-checkout-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !placingOrder
              ) {
                setShowCheckout(false)
                setOrderMessage('')
              }
            }}
          >
            <div
              className="checkout-modal premium-checkout-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkout-title"
            >
              <div className="checkout-modal-header premium-checkout-header">
                <div>
                  <p className="section-eyebrow">SECURE CHECKOUT</p>
                  <h2 id="checkout-title">Review Your Order</h2>
                  <p>Confirm the details below before placing your order.</p>
                </div>

                <button
                  type="button"
                  className="checkout-modal-close premium-modal-close"
                  onClick={() => {
                    if (!placingOrder) {
                      setShowCheckout(false)
                      setOrderMessage('')
                    }
                  }}
                  disabled={placingOrder}
                  aria-label="Close checkout"
                >
                  <FiX />
                </button>
              </div>

              <div className="checkout-customer-box premium-checkout-customer-box">
                <div className="checkout-customer-main">
                  <div className="checkout-avatar"><FiUser /></div>
                  <div>
                    <span>Customer</span>
                    <strong>{user?.name || '-'}</strong>
                  </div>
                </div>

                <div className="checkout-customer-contact">
                  <span><FiMail /> {user?.email || '-'}</span>
                  <span><FiPhone /> {user?.mobile || '-'}</span>
                </div>
              </div>

              <div className="checkout-items premium-checkout-items">
                {cart.map((item) => (
                  <div className="checkout-item premium-checkout-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} × {formatCurrency(item.price)}
                      </span>
                    </div>
                    <strong>
                      {formatCurrency(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="checkout-total premium-checkout-total">
                <span>Total Payable</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              {orderMessage && (
                <div className="cart-order-message cart-order-message-error">
                  {orderMessage}
                </div>
              )}

              <div className="checkout-modal-actions premium-checkout-actions">
                <button
                  type="button"
                  className="premium-secondary-button"
                  onClick={() => {
                    if (!placingOrder) {
                      setShowCheckout(false)
                      setOrderMessage('')
                    }
                  }}
                  disabled={placingOrder}
                >
                  Back to Cart
                </button>

                <button
                  type="button"
                  className="checkout-button premium-checkout-button premium-place-order-button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? (
                    'Placing Order...'
                  ) : (
                    <>
                      <FiCheckCircle />
                      Place Order
                      <FiArrowRight className="checkout-arrow" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Cart
