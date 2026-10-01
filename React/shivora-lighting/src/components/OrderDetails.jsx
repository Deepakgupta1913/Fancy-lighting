import { useEffect, useState } from 'react'

import { formatCurrency as formatStoreCurrency } from '../utils/currency'

import {
  FiArrowLeft,
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiAlertCircle,
} from 'react-icons/fi'

const API_BASE_URL =
  'http://localhost:5000/api'

function OrderDetails({
  orderId,
  currency = 'INR',
  onBack,
}) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================
  // FETCH ORDER DETAILS
  // =========================================

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const token =
        localStorage.getItem(
          'shivora_token'
        )

      if (!token) {
        setError(
          'Your login session has expired. Please login again.'
        )
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}`,
        {
          method: 'GET',

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Unable to fetch order details.'
        )
      }

      setOrder(
        data.order || null
      )
    } catch (error) {
      console.error(
        'Order Details Error:',
        error
      )

      setError(
        error.message ||
          'Unable to load order details.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // =========================================
  // HELPERS
  // =========================================

  const formatCurrency = (value) =>
    formatStoreCurrency(value, currency)

  const formatDate = (value) => {
    if (!value) {
      return '-'
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  const getStatusClass = (status) =>
    `order-details-status status-${String(
      status || ''
    ).toLowerCase()}`

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <section className="order-details-section">

        <div className="order-details-container">

          <div className="order-details-loading">
            <FiPackage />

            <h2>
              Loading Order Details...
            </h2>

            <p>
              Please wait while we retrieve
              your order.
            </p>
          </div>

        </div>

      </section>
    )
  }

  // =========================================
  // ERROR
  // =========================================

  if (error || !order) {
    return (
      <section className="order-details-section">

        <div className="order-details-container">

          <div className="order-details-error">

            <FiAlertCircle />

            <h2>
              Unable to Load Order
            </h2>

            <p>
              {error ||
                'The requested order could not be found.'}
            </p>

            <button
              type="button"
              className="order-details-back-button"
              onClick={onBack}
            >
              <FiArrowLeft />
              Back to My Orders
            </button>

          </div>

        </div>

      </section>
    )
  }

  return (
    <section className="order-details-section">

      <div className="order-details-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="order-details-header">

          <div>

            <p className="section-eyebrow">
              SHIVORA LIGHTING
            </p>

            <h1>
              Order #{order.id}
            </h1>

            <p>
              Complete details for your order.
            </p>

          </div>

          <button
            type="button"
            className="order-details-back-button"
            onClick={onBack}
          >
            <FiArrowLeft />
            Back to My Orders
          </button>

        </div>

        {/* =====================================
            ORDER SUMMARY
        ====================================== */}

        <div className="order-details-summary-grid">

          <div className="order-details-summary-card">

            <div className="order-details-summary-icon">
              <FiPackage />
            </div>

            <span>
              Order ID
            </span>

            <strong>
              #{order.id}
            </strong>

          </div>

          <div className="order-details-summary-card">

            <div className="order-details-summary-icon">
              <FiCalendar />
            </div>

            <span>
              Order Date
            </span>

            <strong>
              {formatDate(
                order.created_at
              )}
            </strong>

          </div>

          <div className="order-details-summary-card">

            <div className="order-details-summary-icon">
              <FiTruck />
            </div>

            <span>
              Order Status
            </span>

            <strong
              className={getStatusClass(
                order.status
              )}
            >
              {order.status}
            </strong>

          </div>

          <div className="order-details-summary-card">

            <div className="order-details-summary-icon">
              <FiCreditCard />
            </div>

            <span>
              Total Amount
            </span>

            <strong>
              {formatCurrency(
                order.total_amount
              )}
            </strong>

          </div>

        </div>

        {/* =====================================
            STATUS TRACKER
        ====================================== */}

        <div className="order-details-card">

          <div className="order-details-card-heading">

            <div>
              <p className="section-eyebrow">
                ORDER PROGRESS
              </p>

              <h2>
                Track Your Order
              </h2>
            </div>

            <FiCheckCircle />

          </div>

          <div className="order-status-timeline">

            {[
              'PENDING',
              'CONFIRMED',
              'PACKED',
              'SHIPPED',
              'DELIVERED',
            ].map((status) => {

              const statusOrder = [
                'PENDING',
                'CONFIRMED',
                'PACKED',
                'SHIPPED',
                'DELIVERED',
              ]

              const currentIndex =
                statusOrder.indexOf(
                  order.status
                )

              const itemIndex =
                statusOrder.indexOf(
                  status
                )

              const completed =
                order.status ===
                  'DELIVERED' ||
                (
                  currentIndex >=
                    0 &&
                  itemIndex <=
                    currentIndex
                )

              return (
                <div
                  className={
                    `order-status-step ` +
                    (completed
                      ? 'completed'
                      : '')
                  }
                  key={status}
                >

                  <div className="order-status-dot">
                    {completed
                      ? <FiCheckCircle />
                      : itemIndex + 1}
                  </div>

                  <span>
                    {status}
                  </span>

                </div>
              )
            })}

          </div>

          {order.status ===
            'CANCELLED' && (
            <div className="order-cancelled-message">
              <FiAlertCircle />

              <span>
                This order has been cancelled.
              </span>
            </div>
          )}

        </div>

        {/* =====================================
            ORDER ITEMS
        ====================================== */}

        <div className="order-details-card">

          <div className="order-details-card-heading">

            <div>
              <p className="section-eyebrow">
                PRODUCTS
              </p>

              <h2>
                Items in Your Order
              </h2>
            </div>

            <FiPackage />

          </div>

          <div className="order-items-list">

            {(order.items || []).map(
              (item) => (
                <div
                  className="order-item-row"
                  key={item.id}
                >

                  <div className="order-item-number">
                    {item.quantity}×
                  </div>

                  <div className="order-item-information">

                    <h3>
                      {item.product_name}
                    </h3>

                    <p>
                      Unit Price:{' '}
                      {formatCurrency(
                        item.price
                      )}
                    </p>

                  </div>

                  <div className="order-item-quantity">
                    Qty: {item.quantity}
                  </div>

                  <strong className="order-item-subtotal">
                    {formatCurrency(
                      item.subtotal
                    )}
                  </strong>

                </div>
              )
            )}

          </div>

          <div className="order-details-total">

            <span>
              Order Total
            </span>

            <strong>
              {formatCurrency(
                order.total_amount
              )}
            </strong>

          </div>

        </div>

        {/* =====================================
            DELIVERY PLACEHOLDER
        ====================================== */}

        <div className="order-details-card order-details-info-card">

          <div className="order-details-card-heading">

            <div>
              <p className="section-eyebrow">
                DELIVERY
              </p>

              <h2>
                Delivery Information
              </h2>
            </div>

            <FiMapPin />

          </div>

          <p>
            Delivery address will be added
            during the checkout and delivery
            module.
          </p>

        </div>

      </div>

    </section>
  )
}

export default OrderDetails
