import { useEffect, useState } from 'react'

import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi'


const API_BASE_URL =
  'http://localhost:5000/api'


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


function AdminCustomerDetails({
  customerId,
  onBack,
}) {
  const [customer, setCustomer] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // =========================================
  // FETCH CUSTOMER DETAILS
  // =========================================

  const fetchCustomerDetails =
    async () => {
      try {
        setLoading(true)
        setError('')

        const token =
          localStorage.getItem(
            'shivora_token'
          )

        if (!token) {
          throw new Error(
            'Authentication token not found.'
          )
        }

        const response =
          await fetch(
            `${API_BASE_URL}/users/customers/${customerId}`,
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
              'Unable to fetch customer details.'
          )
        }

        setCustomer(
          data.customer || null
        )
      } catch (error) {
        console.error(
          'Customer Details Error:',
          error
        )

        setError(
          error.message ||
            'Unable to load customer details.'
        )
      } finally {
        setLoading(false)
      }
    }


  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails()
    }
  }, [customerId])


  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <section className="admin-products-section">

        <div className="admin-customer-details-state">

          <FiRefreshCw />

          <h2>
            Loading Customer...
          </h2>

          <p>
            Fetching customer information
            from MySQL.
          </p>

        </div>

      </section>
    )
  }


  // =========================================
  // ERROR
  // =========================================

  if (error || !customer) {
    return (
      <section className="admin-products-section">

        <div className="admin-customer-details-state">

          <FiXCircle />

          <h2>
            Customer Not Found
          </h2>

          <p>
            {error ||
              'The requested customer could not be found.'}
          </p>

          <button
            type="button"
            className="admin-back-button"
            onClick={onBack}
          >
            <FiArrowLeft />
            Back to Customers
          </button>

        </div>

      </section>
    )
  }


  return (
    <section className="admin-products-section">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="admin-page-header">

        <div>

          <p className="section-eyebrow">
            CUSTOMER MANAGEMENT
          </p>

          <h1>
            Customer Details
          </h1>

          <p>
            Complete account information for
            {` ${customer.name}`}.
          </p>

        </div>


        <button
          type="button"
          className="admin-back-button"
          onClick={onBack}
        >
          <FiArrowLeft />
          Back to Customers
        </button>

      </div>


      {/* =====================================
          PROFILE HEADER
      ====================================== */}

      <div className="admin-customer-details-profile">

        <div className="admin-customer-details-avatar">
          <FiUser />
        </div>

        <div className="admin-customer-details-identity">

          <h2>
            {customer.name}
          </h2>

          <span>
            Customer ID: #{customer.id}
          </span>

          <div className="admin-customer-details-status-row">

            <span
              className={
                customer.accountStatus ===
                'BLOCKED'
                  ? 'product-status-inactive'
                  : 'product-status-active'
              }
            >
              {customer.accountStatus ===
              'BLOCKED'
                ? 'Blocked'
                : 'Active'}
            </span>

            <span className="admin-customer-details-role">
              {customer.role}
            </span>

          </div>

        </div>

      </div>


      {/* =====================================
          DETAILS GRID
      ====================================== */}

      <div className="admin-customer-details-grid">

        {/* CONTACT */}

        <div className="admin-customer-details-card">

          <div className="admin-customer-details-card-heading">

            <FiMail />

            <div>
              <span>
                Email Address
              </span>

              <strong>
                {customer.email}
              </strong>
            </div>

          </div>

          <div
            className={
              customer.emailVerified
                ? 'customer-detail-verification verified'
                : 'customer-detail-verification not-verified'
            }
          >

            {customer.emailVerified ? (
              <FiCheckCircle />
            ) : (
              <FiXCircle />
            )}

            {customer.emailVerified
              ? 'Email Verified'
              : 'Email Not Verified'}

          </div>

        </div>


        {/* MOBILE */}

        <div className="admin-customer-details-card">

          <div className="admin-customer-details-card-heading">

            <FiPhone />

            <div>
              <span>
                Mobile Number
              </span>

              <strong>
                {customer.mobile}
              </strong>
            </div>

          </div>

          <div
            className={
              customer.mobileVerified
                ? 'customer-detail-verification verified'
                : 'customer-detail-verification not-verified'
            }
          >

            {customer.mobileVerified ? (
              <FiCheckCircle />
            ) : (
              <FiXCircle />
            )}

            {customer.mobileVerified
              ? 'Mobile Verified'
              : 'Mobile Not Verified'}

          </div>

        </div>


        {/* ACCOUNT */}

        <div className="admin-customer-details-card">

          <div className="admin-customer-details-card-heading">

            <FiShield />

            <div>
              <span>
                Account Status
              </span>

              <strong>
                {customer.accountStatus}
              </strong>
            </div>

          </div>

          <p>
            Customer account access status.
          </p>

        </div>


        {/* ROLE */}

        <div className="admin-customer-details-card">

          <div className="admin-customer-details-card-heading">

            <FiUser />

            <div>
              <span>
                Account Role
              </span>

              <strong>
                {customer.role}
              </strong>
            </div>

          </div>

          <p>
            Access role assigned to this account.
          </p>

        </div>

      </div>


      {/* =====================================
          ACCOUNT TIMELINE
      ====================================== */}

      <div className="admin-customer-details-card admin-customer-details-dates">

        <div className="admin-customer-details-section-title">

          <FiCalendar />

          <div>

            <p className="section-eyebrow">
              ACCOUNT HISTORY
            </p>

            <h2>
              Account Timeline
            </h2>

          </div>

        </div>


        <div className="admin-customer-details-date-grid">

          <div>

            <span>
              Account Created
            </span>

            <strong>
              {formatDateTime(
                customer.createdAt
              )}
            </strong>

          </div>


          <div>

            <span>
              Last Updated
            </span>

            <strong>
              {formatDateTime(
                customer.updatedAt
              )}
            </strong>

          </div>

        </div>

      </div>

    </section>
  )
}


export default AdminCustomerDetails