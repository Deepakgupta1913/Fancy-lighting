import { formatCurrency } from '../utils/currency'

import { useEffect, useState } from 'react'

import {
  FiUser,
  FiPackage,
  FiHeart,
  FiMail,
  FiPhone,
  FiShield,
  FiLogOut,
  FiArrowLeft,
  FiShoppingBag,
  FiCheckCircle,
} from 'react-icons/fi'

const API_BASE_URL =
  'http://localhost:5000/api'

function UserProfile({
  user,
  currency = 'INR',
  wishlist = [],
  orders = [],
  onBack,
  onLogout,
  onUserUpdate,
  onViewOrder,
}) {
  const [emailVerified, setEmailVerified] =
    useState(
      user?.emailVerified === true ||
      user?.email_verified === true
    )

  const [mobileVerified, setMobileVerified] =
    useState(
      user?.mobileVerified === true ||
      user?.mobile_verified === true
    )

  const [activeChannel, setActiveChannel] =
    useState(null)

  const [otp, setOtp] = useState('')

  const [otpSent, setOtpSent] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [messageType, setMessageType] =
    useState('')

  // =========================================
  // CUSTOMER ORDERS
  // =========================================

  const [
    customerOrders,
    setCustomerOrders,
  ] = useState(orders)

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(false)

  const [
    ordersError,
    setOrdersError,
  ] = useState('')

  // =========================================
  // SEND OTP
  // =========================================

  const handleSendOtp = async (channel) => {
    try {
      setLoading(true)
      setMessage('')
      setMessageType('')

      const token =
        localStorage.getItem(
          'shivora_token'
        )

      if (!token) {
        setMessage(
          'Your login session has expired. Please login again.'
        )

        setMessageType('error')

        return
      }

      const response = await fetch(
        `${API_BASE_URL}/verification/send-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            channel,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            'Unable to send OTP.'
        )

        setMessageType('error')

        return
      }

      setActiveChannel(channel)
      setOtp('')
      setOtpSent(true)

      setMessage(
        `${channel === 'EMAIL'
          ? 'Email'
          : 'Mobile'} OTP sent successfully.`
      )

      setMessageType('success')

    } catch (error) {
      console.error(
        'Send OTP Error:',
        error
      )

      setMessage(
        'Unable to connect to the backend server.'
      )

      setMessageType('error')

    } finally {
      setLoading(false)
    }
  }

  // =========================================
  // VERIFY OTP
  // =========================================

  const handleVerifyOtp = async () => {
    if (!activeChannel) {
      return
    }

    if (!otp.trim()) {
      setMessage(
        'Please enter the OTP.'
      )

      setMessageType('error')

      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setMessage(
        'OTP must contain 6 digits.'
      )

      setMessageType('error')

      return
    }

    try {
      setLoading(true)
      setMessage('')
      setMessageType('')

      const token =
        localStorage.getItem(
          'shivora_token'
        )

      if (!token) {
        setMessage(
          'Your login session has expired. Please login again.'
        )

        setMessageType('error')

        return
      }

      const response = await fetch(
        `${API_BASE_URL}/verification/verify-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            channel:
              activeChannel,

            otp: otp.trim(),
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            'OTP verification failed.'
        )

        setMessageType('error')

        return
      }

      if (
        activeChannel === 'EMAIL'
      ) {
        setEmailVerified(true)
      }

      if (
        activeChannel === 'MOBILE'
      ) {
        setMobileVerified(true)
      }

      // =====================================
      // UPDATE LOCAL USER
      // =====================================

      const storedUser =
        localStorage.getItem(
          'shivora_user'
        )

      if (storedUser) {
        const updatedUser =
          JSON.parse(storedUser)

        if (
          activeChannel === 'EMAIL'
        ) {
          updatedUser.emailVerified =
            true
        }

        if (
          activeChannel === 'MOBILE'
        ) {
          updatedUser.mobileVerified =
            true
        }

        localStorage.setItem(
          'shivora_user',
          JSON.stringify(
            updatedUser
          )
        )

        if (onUserUpdate) {
          onUserUpdate(updatedUser)
        }
      }

      setMessage(
        activeChannel === 'EMAIL'
          ? 'Email verified successfully.'
          : 'Mobile number verified successfully.'
      )

      setMessageType('success')

      setOtp('')
      setOtpSent(false)
      setActiveChannel(null)

    } catch (error) {
      console.error(
        'Verify OTP Error:',
        error
      )

      setMessage(
        'Unable to connect to the backend server.'
      )

      setMessageType('error')

    } finally {
      setLoading(false)
    }
  }

  // =========================================
  // CANCEL OTP
  // =========================================

  const handleCancelVerification = () => {
    setActiveChannel(null)
    setOtp('')
    setOtpSent(false)
    setMessage('')
    setMessageType('')
  }

  // =========================================
  // FETCH CUSTOMER ORDERS
  // =========================================

  const fetchMyOrders = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError('')

      const token =
        localStorage.getItem(
          'shivora_token'
        )

      if (!token) {
        setOrdersError(
          'Please login again.'
        )

        return
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/my`,
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
            'Unable to fetch orders.'
        )
      }

      setCustomerOrders(
        data.orders || []
      )

    } catch (error) {
      console.error(
        'My Orders Error:',
        error
      )

      setOrdersError(
        error.message ||
          'Unable to load orders.'
      )

    } finally {
      setOrdersLoading(false)
    }
  }

  // =========================================
  // LOAD ORDERS WHEN DASHBOARD OPENS
  // =========================================

  useEffect(() => {
    fetchMyOrders()
  }, [])

  return (
    <section className="customer-dashboard-section">

      <div className="customer-dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="customer-dashboard-header">

          <div>

            <p className="section-eyebrow">
              SHIVORA LIGHTING
            </p>

            <h1>
              Customer Dashboard
            </h1>

            <p>
              Welcome, {user?.name || 'Customer'}
            </p>

          </div>

          <div className="customer-dashboard-actions">

            <button
              type="button"
              className="customer-store-button"
              onClick={onBack}
            >
              <FiArrowLeft />
              Store
            </button>

            <button
              type="button"
              className="customer-logout-button"
              onClick={onLogout}
            >
              <FiLogOut />
              Logout
            </button>

          </div>

        </div>

        {/* =================================================
            CUSTOMER INFORMATION
        ================================================= */}

        <div className="customer-profile-card">

          <div className="customer-profile-item">

            <span>
              Customer Name
            </span>

            <strong>
              {user?.name || '-'}
            </strong>

          </div>

          <div className="customer-profile-item">

            <span>
              Email
            </span>

            <strong>
              {user?.email || '-'}
            </strong>

          </div>

          <div className="customer-profile-item">

            <span>
              Mobile
            </span>

            <strong>
              {user?.mobile || '-'}
            </strong>

          </div>

          <div className="customer-profile-item">

            <span>
              Role
            </span>

            <strong>
              {user?.role || 'CUSTOMER'}
            </strong>

          </div>

        </div>

        {/* =================================================
            CUSTOMER CARDS
        ================================================= */}

        <div className="customer-dashboard-grid">

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <div className="customer-dashboard-card">

            <div className="customer-card-icon">
              <FiUser />
            </div>

            <h2>
              Personal Information
            </h2>

            <p className="customer-card-description">
              View your personal account
              information.
            </p>

            <div className="customer-information-list">

              <div className="customer-information-row">

                <span>
                  Name
                </span>

                <strong>
                  {user?.name || '-'}
                </strong>

              </div>

              <div className="customer-information-row">

                <span>
                  Email
                </span>

                <strong>
                  {user?.email || '-'}
                </strong>

              </div>

              <div className="customer-information-row">

                <span>
                  Mobile
                </span>

                <strong>
                  {user?.mobile || '-'}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================================
              MY ORDERS
          ================================================= */}

          <div className="customer-dashboard-card">

            <div className="customer-card-icon">
              <FiPackage />
            </div>

            <h2>
              My Orders
            </h2>

            <p className="customer-card-description">
              View and track your orders.
            </p>

            <div className="customer-stat-area">

              <div className="customer-stat-number">
                {ordersLoading
                  ? '...'
                  : customerOrders.length}
              </div>

              <div className="customer-stat-text">
                Orders placed
              </div>

            </div>

            <button
              type="button"
              className="customer-outline-button"
              onClick={fetchMyOrders}
              disabled={ordersLoading}
            >
              <FiShoppingBag />

              {ordersLoading
                ? 'Loading Orders...'
                : 'Refresh Orders'}
            </button>

          </div>

          {/* =================================================
              WISHLIST
          ================================================= */}

          <div className="customer-dashboard-card">

            <div className="customer-card-icon">
              <FiHeart />
            </div>

            <h2>
              Wishlist
            </h2>

            <p className="customer-card-description">
              Products you have saved for
              later.
            </p>

            <div className="customer-stat-area">

              <div className="customer-stat-number">
                {wishlist.length}
              </div>

              <div className="customer-stat-text">
                Saved products
              </div>

            </div>

            <button
              type="button"
              className="customer-outline-button"
            >
              <FiHeart />
              View Wishlist
            </button>

          </div>

          {/* =================================================
              VERIFICATION
          ================================================= */}

          <div className="customer-dashboard-card">

            <div className="customer-card-icon">

              {emailVerified &&
              mobileVerified ? (
                <FiCheckCircle />
              ) : (
                <FiShield />
              )}

            </div>

            <h2>
              Verification
            </h2>

            <p className="customer-card-description">
              Verify your email and mobile
              number using OTP.
            </p>

            {/* EMAIL + MOBILE STATUS */}

            <div className="customer-verification-list">

              <div className="customer-verification-row">

                <div className="customer-verification-left">

                  <FiMail />

                  <span>
                    Email
                  </span>

                </div>

                <span
                  className={
                    emailVerified
                      ? 'customer-verified'
                      : 'customer-not-verified'
                  }
                >
                  ●{' '}
                  {emailVerified
                    ? 'Verified'
                    : 'Not Verified'}
                </span>

              </div>

              <div className="customer-verification-row">

                <div className="customer-verification-left">

                  <FiPhone />

                  <span>
                    Mobile
                  </span>

                </div>

                <span
                  className={
                    mobileVerified
                      ? 'customer-verified'
                      : 'customer-not-verified'
                  }
                >
                  ●{' '}
                  {mobileVerified
                    ? 'Verified'
                    : 'Not Verified'}
                </span>

              </div>

            </div>

            {/* OTP SECTION */}

            {activeChannel ? (

              <div className="verification-otp-box">

                <h3>
                  Verify{' '}
                  {activeChannel === 'EMAIL'
                    ? 'Email'
                    : 'Mobile'}
                </h3>

                <p>
                  Enter the 6-digit OTP sent to
                  your{' '}
                  {activeChannel === 'EMAIL'
                    ? 'email address.'
                    : 'mobile number.'}
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={otp}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ''
                      )

                    setOtp(value)
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="verification-otp-input"
                />

                <div className="verification-otp-actions">

                  <button
                    type="button"
                    className="customer-outline-button"
                    onClick={
                      handleVerifyOtp
                    }
                    disabled={
                      loading ||
                      otp.length !== 6
                    }
                  >
                    <FiCheckCircle />

                    {loading
                      ? 'Verifying...'
                      : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    className="verification-resend-button"
                    onClick={() =>
                      handleSendOtp(
                        activeChannel
                      )
                    }
                    disabled={loading}
                  >
                    Resend OTP
                  </button>

                  <button
                    type="button"
                    className="verification-cancel-button"
                    onClick={
                      handleCancelVerification
                    }
                    disabled={loading}
                  >
                    Cancel
                  </button>

                </div>

              </div>

            ) : (

              <div className="verification-action-area">

                {!emailVerified && (
                  <button
                    type="button"
                    className="customer-outline-button"
                    onClick={() =>
                      handleSendOtp('EMAIL')
                    }
                    disabled={loading}
                  >
                    <FiMail />

                    {loading
                      ? 'Sending...'
                      : 'Verify Email'}
                  </button>
                )}

                {!mobileVerified && (
                  <button
                    type="button"
                    className="customer-outline-button"
                    onClick={() =>
                      handleSendOtp('MOBILE')
                    }
                    disabled={loading}
                  >
                    <FiPhone />

                    {loading
                      ? 'Sending...'
                      : 'Verify Mobile'}
                  </button>
                )}

              </div>

            )}

            {/* MESSAGE */}

            {message && (
              <div
                className={
                  messageType === 'success'
                    ? 'verification-success-message'
                    : 'verification-error-message'
                }
              >
                {message}
              </div>
            )}

            {/* ACCOUNT TYPE */}

            <div className="customer-account-type">

              <div>

                <FiShield />

                <span>
                  Account Type
                </span>

              </div>

              <strong>
                {user?.role || 'CUSTOMER'}
              </strong>

            </div>

          </div>

        </div>

        {/* =================================================
            MY ORDERS LIST
        ================================================= */}

        <div className="customer-orders-section">

          <div className="customer-orders-header">

            <div>

              <p className="section-eyebrow">
                ORDER HISTORY
              </p>

              <h2>
                My Orders
              </h2>

              <p>
                View your recent Shivora Lighting
                orders.
              </p>

            </div>

            <button
              type="button"
              className="customer-outline-button"
              onClick={fetchMyOrders}
              disabled={ordersLoading}
            >
              <FiShoppingBag />

              {ordersLoading
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

          </div>

          {ordersLoading ? (

            <div className="customer-orders-empty">
              Loading your orders...
            </div>

          ) : customerOrders.length === 0 ? (

            <div className="customer-orders-empty">

              <FiShoppingBag />

              <h3>
                No Orders Yet
              </h3>

              <p>
                Your completed orders will appear here.
              </p>

            </div>

          ) : (

            <div className="customer-orders-list">

              {customerOrders.map((order) => (

                <div
                  className="customer-order-row customer-order-row-clickable"
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    onViewOrder?.(order.id)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault()
                      onViewOrder?.(order.id)
                    }
                  }}
                >

                  <div>

                    <span>
                      Order ID
                    </span>

                    <strong>
                      #{order.id}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Date
                    </span>

                    <strong>
                      {order.created_at
                        ? new Date(
                            order.created_at
                          ).toLocaleDateString(
                            'en-IN'
                          )
                        : '-'}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      {formatCurrency(
                        order.total_amount,
                        currency
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Status
                    </span>

                    <strong
                      className={
                        `customer-order-status ` +
                        `status-${String(
                          order.status || ''
                        ).toLowerCase()}`
                      }
                    >
                      {order.status}
                    </strong>

                  </div>

                  <div className="customer-order-view-details">
                    View Details →
                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </section>
  )
}

export default UserProfile
