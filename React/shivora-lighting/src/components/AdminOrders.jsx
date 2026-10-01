import { useEffect, useMemo, useState } from 'react'

import {
  FiArrowLeft,
  FiRefreshCw,
  FiShoppingBag,
  FiEye,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiSearch,
} from 'react-icons/fi'

import './AdminOrdersPremium.css'

import { formatCurrency as formatStoreCurrency } from '../utils/currency'

const API_BASE_URL = 'http://localhost:5000/api'

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

function AdminOrders({ currency = 'INR', onBack }) {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const token = localStorage.getItem('shivora_token')

  const formatCurrency = (value) =>
    formatStoreCurrency(value, currency)

  const formatDate = (value) => {
    if (!value) return '-'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getStatusClass = (status) =>
    `admin-order-status status-${String(status || '')
      .toLowerCase()
      .replace(/\s+/g, '-')}`

  const fetchAdminOrders = async () => {
    try {
      setLoading(true)
      setError('')

      if (!token) {
        throw new Error(
          'Admin authentication token not found. Please login again.'
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/admin`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to fetch admin orders.'
        )
      }

      setOrders(data.orders || [])
    } catch (fetchError) {
      console.error('Admin Orders Error:', fetchError)
      setError(
        fetchError.message || 'Unable to load orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailLoading(true)
      setError('')

      if (!token) {
        throw new Error(
          'Admin authentication token not found. Please login again.'
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/admin/${orderId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to fetch order details.'
        )
      }

      setSelectedOrder(data.order || null)
    } catch (fetchError) {
      console.error('Admin Order Details Error:', fetchError)
      setError(
        fetchError.message ||
          'Unable to load order details.'
      )
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOpenOrder = (orderId) => {
    setMessage('')
    setError('')
    fetchOrderDetails(orderId)
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId)
      setMessage('')
      setError('')

      if (!token) {
        throw new Error(
          'Admin authentication token not found. Please login again.'
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/admin/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to update order status.'
        )
      }

      setMessage(`Order #${orderId} updated to ${status}.`)
      await fetchAdminOrders()

      if (selectedOrder?.id === Number(orderId)) {
        await fetchOrderDetails(orderId)
      }
    } catch (statusError) {
      console.error('Admin Order Status Error:', statusError)
      setError(
        statusError.message ||
          'Unable to update order status.'
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  useEffect(() => {
    fetchAdminOrders()
    // Admin page is intentionally loaded once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        String(order.status || '').toUpperCase() === statusFilter

      if (!matchesStatus) return false
      if (!term) return true

      const customerName =
        order.customer?.name || ''
      const customerEmail =
        order.customer?.email || ''
      const customerMobile =
        order.customer?.mobile || ''

      return (
        String(order.id).includes(term) ||
        customerName.toLowerCase().includes(term) ||
        customerEmail.toLowerCase().includes(term) ||
        customerMobile.toLowerCase().includes(term)
      )
    })
  }, [orders, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(
      (order) => order.status === 'PENDING'
    ).length
    const activeOrders = orders.filter(
      (order) =>
        ['CONFIRMED', 'PACKED', 'SHIPPED'].includes(order.status)
    ).length
    const deliveredOrders = orders.filter(
      (order) => order.status === 'DELIVERED'
    ).length
    const totalRevenue = orders
      .filter((order) => order.status !== 'CANCELLED')
      .reduce(
        (total, order) =>
          total + Number(order.total_amount || 0),
        0
      )

    return {
      totalOrders,
      pendingOrders,
      activeOrders,
      deliveredOrders,
      totalRevenue,
    }
  }, [orders])

  if (loading) {
    return (
      <section className="admin-orders-section">
        <div className="admin-orders-container">
          <div className="admin-orders-loading-card">
            <FiShoppingBag />
            <h2>Loading Orders</h2>
            <p>Reading live order data from MySQL...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-orders-section">
      <div className="admin-orders-container">
        <div className="admin-orders-header premium-admin-orders-header">
          <div>
            <p className="section-eyebrow">ORDER MANAGEMENT</p>
            <h1>Customer Orders</h1>
            <p>
              View customer information, purchased products, totals and live
              order status from the database.
            </p>
          </div>

          <div className="admin-orders-actions">
            <button
              type="button"
              className="admin-refresh-button premium-admin-secondary-button"
              onClick={fetchAdminOrders}
              disabled={loading}
            >
              <FiRefreshCw />
              Refresh
            </button>

            <button
              type="button"
              className="admin-back-button premium-admin-secondary-button"
              onClick={onBack}
            >
              <FiArrowLeft />
              Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-order-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-order-message success">
            {message}
          </div>
        )}

        <div className="admin-order-stats-grid">
          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon"><FiShoppingBag /></div>
            <span>Total Orders</span>
            <strong>{stats.totalOrders}</strong>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon"><FiPackage /></div>
            <span>Pending</span>
            <strong>{stats.pendingOrders}</strong>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon"><FiTruck /></div>
            <span>In Progress</span>
            <strong>{stats.activeOrders}</strong>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon"><FiCheckCircle /></div>
            <span>Delivered</span>
            <strong>{stats.deliveredOrders}</strong>
          </div>

          <div className="admin-order-stat-card admin-order-stat-revenue">
            <div className="admin-order-stat-icon"><FiCreditCard /></div>
            <span>Order Value</span>
            <strong>{formatCurrency(stats.totalRevenue)}</strong>
          </div>
        </div>

        <div className="admin-order-toolbar">
          <div className="admin-order-search">
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search order, customer, email or mobile..."
              aria-label="Search orders"
            />
          </div>

          <select
            className="admin-order-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter orders by status"
          >
            <option value="ALL">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-orders-table-wrapper premium-admin-orders-table-wrapper">
          {visibleOrders.length === 0 ? (
            <div className="admin-orders-empty">
              <FiShoppingBag />
              <h2>No matching orders</h2>
              <p>
                {orders.length === 0
                  ? 'No customer orders have been stored yet.'
                  : 'Try a different search term or status filter.'}
              </p>
            </div>
          ) : (
            <table className="admin-orders-table premium-admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {visibleOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOpenOrder(order.id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleOpenOrder(order.id)
                      }
                    }}
                  >
                    <td>
                      <div className="admin-table-order-id">
                        <strong>#{order.id}</strong>
                        <span>
                          {order.itemCount || 0}{' '}
                          {Number(order.itemCount) === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-table-customer">
                        <strong>{order.customer?.name || '-'}</strong>
                        <span>
                          Customer ID: {order.customer?.id || order.user_id || '-'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-table-contact">
                        <span><FiMail /> {order.customer?.email || '-'}</span>
                        <span><FiPhone /> {order.customer?.mobile || '-'}</span>
                      </div>
                    </td>

                    <td>{order.itemCount || 0}</td>

                    <td>
                      <strong>{formatCurrency(order.total_amount)}</strong>
                    </td>

                    <td>
                      <span className={getStatusClass(order.status)}>
                        {order.status || '-'}
                      </span>
                    </td>

                    <td>
                      <span className="admin-table-date">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-order-view-button premium-order-view-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleOpenOrder(order.id)
                        }}
                        aria-label={`View order ${order.id}`}
                        title="View order"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedOrder && (
          <div
            className="admin-order-detail-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !updatingOrderId) {
                setSelectedOrder(null)
              }
            }}
          >
            <div
              className="admin-order-detail-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-order-detail-title"
            >
              <div className="admin-order-detail-header">
                <div>
                  <p className="section-eyebrow">ORDER DETAILS</p>
                  <h2 id="admin-order-detail-title">
                    Order #{selectedOrder.id}
                  </h2>
                  <p>
                    Customer and order information loaded from MySQL.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-order-close-button"
                  onClick={() => setSelectedOrder(null)}
                  disabled={Boolean(updatingOrderId)}
                  aria-label="Close order details"
                >
                  <FiX />
                </button>
              </div>

              {detailLoading ? (
                <div className="admin-detail-loading">
                  Loading order details...
                </div>
              ) : (
                <>
                  <div className="admin-order-detail-grid">
                    <div className="admin-order-card">
                      <div className="admin-order-card-title">
                        <FiUser />
                        <h3>Customer</h3>
                      </div>

                      <div className="admin-customer-info">
                        <div>
                          <FiUser />
                          <span>
                            <small>Name</small>
                            <strong>{selectedOrder.customer?.name || '-'}</strong>
                          </span>
                        </div>
                        <div>
                          <FiMail />
                          <span>
                            <small>Email</small>
                            <strong>{selectedOrder.customer?.email || '-'}</strong>
                          </span>
                        </div>
                        <div>
                          <FiPhone />
                          <span>
                            <small>Mobile</small>
                            <strong>{selectedOrder.customer?.mobile || '-'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-order-card">
                      <div className="admin-order-card-title">
                        <FiTruck />
                        <h3>Order Status</h3>
                      </div>

                      <div className="admin-status-control">
                        <span>Update status</span>
                        <select
                          value={selectedOrder.status || 'PENDING'}
                          onChange={(event) =>
                            handleStatusChange(
                              selectedOrder.id,
                              event.target.value
                            )
                          }
                          disabled={
                            updatingOrderId === selectedOrder.id
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option value={status} key={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {updatingOrderId === selectedOrder.id && (
                        <p className="admin-status-loading">
                          Updating order status...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="admin-order-card">
                    <div className="admin-order-card-title">
                      <FiShoppingBag />
                      <h3>Order Summary</h3>
                    </div>

                    <div className="admin-order-info-grid">
                      <div>
                        <span>Order ID</span>
                        <strong>#{selectedOrder.id}</strong>
                      </div>
                      <div>
                        <span>Order Date</span>
                        <strong>{formatDate(selectedOrder.created_at)}</strong>
                      </div>
                      <div>
                        <span>Items</span>
                        <strong>{selectedOrder.itemCount || (selectedOrder.items || []).length}</strong>
                      </div>
                      <div>
                        <span>Total</span>
                        <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="admin-order-card">
                    <div className="admin-order-card-title">
                      <FiPackage />
                      <h3>Products in This Order</h3>
                    </div>

                    <div className="admin-order-items">
                      {(selectedOrder.items || []).map((item) => (
                        <div className="admin-order-item" key={item.id}>
                          <div>
                            <strong>{item.product_name}</strong>
                            <span>
                              Unit Price: {formatCurrency(item.price)}
                            </span>
                          </div>
                          <span>Qty: {item.quantity}</span>
                          <strong>{formatCurrency(item.subtotal)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-total">
                      <span>Order Total</span>
                      <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminOrders
