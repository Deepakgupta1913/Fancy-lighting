import {
  FiArrowLeft,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiShield,
} from 'react-icons/fi'


function AdminDashboard({
  user,
  products = [],
  onBack,
  onLogout,
  onProducts,
  onOrders,
  onCustomers,
  onSettings,
}) {

  // =========================================
  // PRODUCT STATUS HELPERS
  // =========================================

  const isProductActive = (product) => {
    if (
      typeof product?.isActive === 'boolean'
    ) {
      return product.isActive
    }

    if (
      typeof product?.is_active === 'boolean'
    ) {
      return product.is_active
    }

    return Number(
      product?.isActive ??
      product?.is_active ??
      0
    ) === 1
  }


  // =========================================
  // DASHBOARD COUNTS
  // =========================================

  const safeProducts =
    Array.isArray(products)
      ? products
      : []

  const totalProducts =
    safeProducts.length

  const activeProducts =
    safeProducts.filter(
      isProductActive
    ).length

  const inactiveProducts =
    totalProducts -
    activeProducts

  const outOfStockProducts =
    safeProducts.filter(
      (product) =>
        Number(product?.stock ?? 0) <= 0
    ).length


  // =========================================
  // MANAGEMENT CARD
  // =========================================

  const renderManagementCard = ({
    icon,
    title,
    description,
    onClick,
    disabled = false,
    linkText,
  }) => (
    <button
      type="button"
      className={
        disabled
          ? 'admin-dashboard-card admin-dashboard-card-disabled'
          : 'admin-dashboard-card'
      }
      onClick={
        disabled
          ? undefined
          : onClick
      }
      disabled={disabled}
    >
      {icon}

      <h2>
        {title}
      </h2>

      <p>
        {description}
      </p>

      <span className="admin-card-link">
        {disabled
          ? 'Coming Soon'
          : linkText || 'Open'}
        {!disabled && (
          <FiChevronRight />
        )}
      </span>
    </button>
  )


  return (
    <section className="admin-dashboard-section">

      <div className="admin-dashboard-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="admin-dashboard-header">

          <div>

            <p className="section-eyebrow">
              SHIVORA LIGHTING
            </p>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage your store from one place.
            </p>

          </div>


          <div className="admin-dashboard-actions">

            <button
              type="button"
              className="admin-back-button"
              onClick={onBack}
            >
              <FiArrowLeft />
              Store
            </button>


            <button
              type="button"
              className="admin-logout-button"
              onClick={onLogout}
            >
              <FiLogOut />
              Logout
            </button>

          </div>

        </div>


        {/* =====================================
            ADMIN PROFILE
        ====================================== */}

        <div className="admin-profile-card">

          <div>
            <span>
              Administrator
            </span>

            <strong>
              {user?.name || 'Admin'}
            </strong>
          </div>


          <div>
            <span>
              Email
            </span>

            <strong>
              {user?.email || '-'}
            </strong>
          </div>


          <div>
            <span>
              Role
            </span>

            <strong>
              {user?.role || 'ADMIN'}
            </strong>
          </div>


          <div>
            <span>
              Store
            </span>

            <strong>
              Shivora Lighting
            </strong>
          </div>

        </div>


        {/* =====================================
            STATISTICS
        ====================================== */}

        <div className="admin-section-title">

          <p className="section-eyebrow">
            STORE OVERVIEW
          </p>

          <h2>
            Product Statistics
          </h2>

        </div>


        <div className="admin-stats-grid">

          {/* TOTAL */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <FiBox />
            </div>

            <div>

              <span>
                Total Products
              </span>

              <strong>
                {totalProducts}
              </strong>

              <small>
                All catalog products
              </small>

            </div>

          </div>


          {/* ACTIVE */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <FiShoppingBag />
            </div>

            <div>

              <span>
                Active Products
              </span>

              <strong>
                {activeProducts}
              </strong>

              <small>
                Visible in storefront
              </small>

            </div>

          </div>


          {/* INACTIVE */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <FiBox />
            </div>

            <div>

              <span>
                Inactive Products
              </span>

              <strong>
                {inactiveProducts}
              </strong>

              <small>
                Hidden from storefront
              </small>

            </div>

          </div>


          {/* OUT OF STOCK */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <FiShoppingBag />
            </div>

            <div>

              <span>
                Out of Stock
              </span>

              <strong>
                {outOfStockProducts}
              </strong>

              <small>
                Stock quantity is zero
              </small>

            </div>

          </div>

        </div>


        {/* =====================================
            MANAGEMENT
        ====================================== */}

        <div className="admin-section-title">

          <p className="section-eyebrow">
            MANAGEMENT
          </p>

          <h2>
            Store Management
          </h2>

        </div>


        <div className="admin-dashboard-grid">

          {/* PRODUCTS */}

          {renderManagementCard({
            icon: <FiBox />,
            title: 'Products',
            description:
              'Add new products, update pricing, manage stock and control product visibility.',
            onClick: onProducts,
            disabled:
              typeof onProducts !== 'function',
            linkText:
              'Manage Products',
          })}


          {/* ORDERS */}

          {renderManagementCard({
            icon: <FiShoppingBag />,
            title: 'Orders',
            description:
              'View customer orders and manage the order workflow.',
            onClick: onOrders,
            disabled:
              typeof onOrders !== 'function',
            linkText:
              'Manage Orders',
          })}


          {/* CUSTOMERS */}

          {renderManagementCard({
            icon: <FiUsers />,
            title: 'Customers',
            description:
              'View registered customers, verification details and account status.',
            onClick: onCustomers,
            disabled:
              typeof onCustomers !== 'function',
            linkText:
              'Manage Customers',
          })}


          {/* SETTINGS */}

          {renderManagementCard({
            icon: <FiSettings />,
            title: 'Store Settings',
            description:
              'Manage store configuration, contact information and appearance settings.',
            onClick: onSettings,
            disabled:
              typeof onSettings !== 'function',
            linkText:
              'Open Settings',
          })}

        </div>


        {/* =====================================
            SECURITY
        ====================================== */}

        <div className="admin-security-card">

          <div className="admin-security-icon">
            <FiShield />
          </div>

          <div>

            <strong>
              Admin access protected
            </strong>

            <p>
              Dashboard APIs require a valid
              authentication token and ADMIN role.
            </p>

          </div>

        </div>

      </div>

    </section>
  )
}


export default AdminDashboard
