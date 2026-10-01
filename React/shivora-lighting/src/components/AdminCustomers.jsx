import { useEffect, useState } from 'react'

import {
  FiArrowLeft,
  FiUsers,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiLock,
  FiUnlock,
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


function AdminCustomers({
  user,
  onBack,
}) {
  const [customers, setCustomers] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [updatingCustomerId, setUpdatingCustomerId] =
    useState(null)


  // =========================================
  // FETCH CUSTOMERS
  // =========================================

  const fetchCustomers = async () => {
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
          `${API_BASE_URL}/users/customers`,
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
            'Failed to fetch customers.'
        )
      }

      setCustomers(
        data.customers || []
      )

    } catch (error) {
      console.error(
        'Customers API Error:',
        error
      )

      setError(
        error.message ||
          'Unable to load customers.'
      )

    } finally {
      setLoading(false)
    }
  }


  // =========================================
  // LOAD CUSTOMERS
  // =========================================

  useEffect(() => {
    fetchCustomers()
  }, [])


  // =========================================
  // UPDATE CUSTOMER STATUS
  // =========================================

  const handleStatusChange = async (
    customer
  ) => {
    const isBlocked =
      customer.accountStatus ===
      'BLOCKED'

    const newStatus =
      isBlocked
        ? 'ACTIVE'
        : 'BLOCKED'

    const actionText =
      isBlocked
        ? 'unblock'
        : 'block'

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText} "${customer.name}"?`
      )

    if (!confirmed) {
      return
    }

    try {
      setUpdatingCustomerId(
        customer.id
      )

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
          `${API_BASE_URL}/users/customers/${customer.id}/status`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              accountStatus:
                newStatus,
            }),
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
            'Unable to update customer status.'
        )
      }

      // Refresh data from MySQL
      await fetchCustomers()

    } catch (error) {
      console.error(
        'Customer Status Error:',
        error
      )

      setError(
        error.message ||
          'Unable to update customer status.'
      )

    } finally {
      setUpdatingCustomerId(
        null
      )
    }
  }


  // =========================================
  // REFRESH
  // =========================================

  const handleRefresh = () => {
    fetchCustomers()
  }


  // =========================================
  // COUNTS
  // =========================================

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.accountStatus ===
        'ACTIVE'
    ).length

  const blockedCustomers =
    customers.filter(
      (customer) =>
        customer.accountStatus ===
        'BLOCKED'
    ).length


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
            Customers
          </h1>

          <p>
            View and manage registered
            Shivora Lighting customers.
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
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw />

            {loading
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

        </div>

      </div>


      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="admin-profile-card">

        <div>

          <span>
            Total Customers
          </span>

          <strong>
            {customers.length}
          </strong>

        </div>


        <div>

          <span>
            Active
          </span>

          <strong>
            {activeCustomers}
          </strong>

        </div>


        <div>

          <span>
            Blocked
          </span>

          <strong>
            {blockedCustomers}
          </strong>

        </div>


        <div>

          <span>
            Current Admin
          </span>

          <strong>
            {user?.name || 'Admin'}
          </strong>

        </div>

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div className="admin-error-message">

          <FiXCircle />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================
          CUSTOMER TABLE
      ====================================== */}

      <div className="admin-product-table-wrapper">

        {loading ? (

          <div className="admin-products-empty">

            <FiRefreshCw />

            <strong>
              Loading customers...
            </strong>

            <span>
              Fetching customer accounts
              from MySQL.
            </span>

          </div>

        ) : customers.length === 0 ? (

          <div className="admin-products-empty">

            <FiUsers />

            <strong>
              No customers found
            </strong>

            <span>
              No customer accounts are
              currently registered.
            </span>

          </div>

        ) : (

          <table className="admin-product-table admin-customer-table">

            <thead>

              <tr>

                <th>
                  Customer
                </th>

                <th>
                  Contact
                </th>

                <th>
                  Email
                </th>

                <th>
                  Mobile
                </th>

                <th>
                  Account
                </th>

                <th>
                  Joined
                </th>

                <th>
                  Updated
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {customers.map(
                (customer) => {

                  const isBlocked =
                    customer.accountStatus ===
                    'BLOCKED'

                  const isUpdating =
                    updatingCustomerId ===
                    customer.id

                  return (

                    <tr
                      key={customer.id}
                    >

                      {/* CUSTOMER */}

                      <td>

                        <div
                          className="admin-product-name"
                        >

                          <div
                            className="admin-product-image"
                          >
                            <FiUsers />
                          </div>


                          <div>

                            <strong>
                              {customer.name}
                            </strong>

                            <span>
                              ID: {customer.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CONTACT */}

                      <td>

                        <div
                          className="admin-customer-contact"
                        >

                          <div>

                            <FiMail />

                            <span>
                              {customer.email}
                            </span>

                          </div>


                          <div>

                            <FiPhone />

                            <span>
                              {customer.mobile}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        {customer.emailVerified ? (

                          <span className="verification-status verified">

                            <FiCheckCircle />

                            Verified

                          </span>

                        ) : (

                          <span className="verification-status not-verified">

                            <FiXCircle />

                            Not Verified

                          </span>

                        )}

                      </td>


                      {/* MOBILE */}

                      <td>

                        {customer.mobileVerified ? (

                          <span className="verification-status verified">

                            <FiCheckCircle />

                            Verified

                          </span>

                        ) : (

                          <span className="verification-status not-verified">

                            <FiXCircle />

                            Not Verified

                          </span>

                        )}

                      </td>


                      {/* ACCOUNT STATUS */}

                      <td>

                        <span
                          className={
                            isBlocked
                              ? 'product-status-inactive'
                              : 'product-status-active'
                          }
                        >
                          {isBlocked
                            ? 'Blocked'
                            : 'Active'}
                        </span>

                      </td>


                      {/* CREATED */}

                      <td>

                        <span className="admin-product-date">

                          {formatDateTime(
                            customer.createdAt
                          )}

                        </span>

                      </td>


                      {/* UPDATED */}

                      <td>

                        <span className="admin-product-date">

                          {formatDateTime(
                            customer.updatedAt
                          )}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className={
                            isBlocked
                              ? 'admin-add-button'
                              : 'admin-delete-button'
                          }
                          onClick={() =>
                            handleStatusChange(
                              customer
                            )
                          }
                          disabled={
                            isUpdating
                          }
                          title={
                            isBlocked
                              ? 'Unblock customer'
                              : 'Block customer'
                          }
                        >

                          {isUpdating ? (

                            <FiRefreshCw />

                          ) : isBlocked ? (

                            <FiUnlock />

                          ) : (

                            <FiLock />

                          )}

                          {isUpdating
                            ? 'Updating...'
                            : isBlocked
                            ? 'Unblock'
                            : 'Block'}

                        </button>

                      </td>

                    </tr>

                  )
                }
              )}

            </tbody>

          </table>

        )}

      </div>

    </section>
  )
}


export default AdminCustomers