import React from 'react'
import {
  useEffect,
  useState,
} from 'react'

import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHeart,
} from 'react-icons/fi'

import ProductCard from './components/ProductCard'
import ProductDetails from './components/ProductDetails'
import Cart from './components/Cart'
import Auth from './components/Auth'
import UserProfile from './components/UserProfile'
import AdminDashboard from './components/AdminDashboard'
import AdminProducts from './components/AdminProducts'
import AdminOrders from './components/AdminOrders'
import AdminCustomers from './components/AdminCustomers'
import AdminSettings from './components/AdminSettings'
import OrderDetails from './components/OrderDetails'

import './App.css'

const API_BASE_URL =
  'http://localhost:5000/api'

function App() {
  // =========================================
  // CART
  // =========================================

  const [cart, setCart] = useState([])


  // =========================================
  // WISHLIST
  // =========================================

  const [wishlist, setWishlist] =
    useState([])


  // =========================================
  // SEARCH
  // =========================================

  const [searchTerm, setSearchTerm] =
    useState('')


  // =========================================
  // CURRENT PAGE
  // =========================================

  const [currentPage, setCurrentPage] =
    useState('home')


  // =========================================
  // SELECTED PRODUCT
  // =========================================

  const [selectedProduct, setSelectedProduct] =
    useState(null)

  // =========================================
  // SELECTED ORDER
  // =========================================

  const [selectedOrderId, setSelectedOrderId] =
    useState(null)


  // =========================================
  // LOGGED-IN USER
  // =========================================

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem(
        'shivora_user'
      )

    if (!savedUser) {
      return null
    }

    try {
      return JSON.parse(savedUser)
    } catch (error) {
      console.error(
        'Invalid saved user data:',
        error
      )

      localStorage.removeItem(
        'shivora_user'
      )

      return null
    }
  })


  // =========================================
  // CUSTOMER PRODUCTS
  // =========================================

  const [storeProducts, setStoreProducts] =
    useState([])

  const [productsLoading, setProductsLoading] =
    useState(true)

  const [productsError, setProductsError] =
    useState('')


  // =========================================
  // ADMIN PRODUCTS
  // =========================================

  const [adminProducts, setAdminProducts] =
    useState([])


  // =========================================
  // FETCH CUSTOMER PRODUCTS
  // =========================================

  const fetchStoreProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError('')

      const response = await fetch(
        `${API_BASE_URL}/products`
      )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to fetch products.'
        )
      }

      const formattedProducts =
        (data.products || []).map(
          (product) => ({
            ...product,

            image: product.image
              ? product.image.startsWith(
                  'http'
                )
                ? product.image
                : `http://localhost:5000${product.image}`
              : '',
          })
        )

      setStoreProducts(
        formattedProducts
      )
    } catch (error) {
      console.error(
        'Store Products Error:',
        error
      )

      setProductsError(
        error.message ||
          'Unable to load products.'
      )
    } finally {
      setProductsLoading(false)
    }
  }


  // =========================================
  // LOAD PRODUCTS WHEN APP STARTS
  // =========================================

  useEffect(() => {
    fetchStoreProducts()
  }, [])


  // =========================================
  // FILTER CUSTOMER PRODUCTS
  // =========================================

  const filteredProducts =
    storeProducts.filter((product) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim()

      if (!search) {
        return true
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.category
          ?.toLowerCase()
          .includes(search)
      )
    })


  // =========================================
  // ADD TO CART
  // =========================================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct =
        currentCart.find(
          (item) =>
            item.id === product.id
        )

      if (existingProduct) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        )
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }


  // =========================================
  // TOGGLE WISHLIST
  // =========================================

  const toggleWishlist = (product) => {
    setWishlist(
      (currentWishlist) => {
        const exists =
          currentWishlist.some(
            (item) =>
              item.id === product.id
          )

        if (exists) {
          return currentWishlist.filter(
            (item) =>
              item.id !== product.id
          )
        }

        return [
          ...currentWishlist,
          product,
        ]
      }
    )
  }


  // =========================================
  // REMOVE FROM WISHLIST
  // =========================================

  const removeFromWishlist = (
    product
  ) => {
    setWishlist(
      (currentWishlist) =>
        currentWishlist.filter(
          (item) =>
            item.id !== product.id
        )
    )
  }


  // =========================================
  // CART COUNT
  // =========================================

  const cartItemCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    )


  // =========================================
  // NAVIGATION
  // =========================================

  const navigateTo = (page) => {
    setSelectedProduct(null)
    setSelectedOrderId(null)
    setCurrentPage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // =========================================
  // OPEN PRODUCT
  // =========================================

  const openProduct = (product) => {
    setSelectedProduct(product)
    setCurrentPage('product')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // =========================================
  // BACK TO PRODUCTS
  // =========================================

  const backToProducts = () => {
    setSelectedProduct(null)
    setCurrentPage('products')

    setTimeout(() => {
      document
        .getElementById('products')
        ?.scrollIntoView({
          behavior: 'smooth',
        })
    }, 50)
  }

  // =========================================
  // OPEN ORDER DETAILS
  // =========================================

  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId)
    setSelectedProduct(null)
    setCurrentPage('order-details')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // =========================================
  // LOGIN SUCCESS
  // =========================================

  const handleLoginSuccess = (
    loggedInUser
  ) => {
    console.log(
      'Logged in user:',
      loggedInUser
    )

    setUser(loggedInUser)

    if (
      loggedInUser.role === 'ADMIN'
    ) {
      setCurrentPage('admin')

      // Load admin product data so dashboard
      // statistics are available immediately.
      fetchAdminProducts().catch((error) => {
        console.error(
          'Admin Products Load Error:',
          error
        )
      })
    } else {
      setCurrentPage('profile')
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem(
      'shivora_token'
    )

    localStorage.removeItem(
      'shivora_user'
    )

    setUser(null)

    setAdminProducts([])

    setSelectedProduct(null)

    setCurrentPage('home')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // =========================================
// VERIFY LOGGED-IN USER
// =========================================

  useEffect(() => {
    const verifyLoggedInUser = async () => {
      const token =
        localStorage.getItem(
          'shivora_token'
        )

      // No token means user is not logged in
      if (!token) {
        console.log(
          'AUTH ME: No token found.'
        )

        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
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

        console.log(
          'AUTH ME STATUS:',
          response.status
        )

        console.log(
          'AUTH ME RESPONSE:',
          data
        )

        // =====================================
        // TOKEN INVALID / EXPIRED
        // =====================================

        if (
          !response.ok ||
          !data.success
        ) {
          console.error(
            'AUTH ME FAILED:',
            data.message
          )

          localStorage.removeItem(
            'shivora_token'
          )

          localStorage.removeItem(
            'shivora_user'
          )

          setUser(null)

          return
        }

        // =====================================
        // BACKEND USER IS VALID
        // =====================================

        console.log(
          'AUTH ME SUCCESS:',
          data.user
        )

        setUser(data.user)

        localStorage.setItem(
          'shivora_user',
          JSON.stringify(data.user)
        )

        // Reload admin products after a browser refresh
        // so dashboard statistics are not empty.
        if (data.user.role === 'ADMIN') {
          fetchAdminProducts().catch((error) => {
            console.error(
              'Admin Products Restore Error:',
              error
            )
          })
        }

      } catch (error) {
        console.error(
          'Authentication Verification Error:',
          error
        )
      }
    }

    verifyLoggedInUser()
  }, [])

  // =========================================
  // OPEN ACCOUNT
  // =========================================

  const openAccount = () => {
    if (!user) {
      navigateTo('auth')
      return
    }

    if (user.role === 'ADMIN') {
      navigateTo('admin')
      return
    }

    navigateTo('profile')
  }


  // =========================================
  // FETCH ADMIN PRODUCTS
  // =========================================

  const fetchAdminProducts =
    async () => {
      const token =
        localStorage.getItem(
          'shivora_token'
        )

      if (!token) {
        throw new Error(
          'Admin authentication token not found.'
        )
      }

      const response =
        await fetch(
          `${API_BASE_URL}/products/admin/all`,
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
            'Failed to fetch admin products.'
        )
      }

      const formattedProducts =
        (data.products || []).map(
          (product) => ({
            ...product,

            image: product.image
              ? product.image.startsWith(
                  'http'
                )
                ? product.image
                : `http://localhost:5000${product.image}`
              : '',
          })
        )

      setAdminProducts(
        formattedProducts
      )

      return formattedProducts
    }


  // =========================================
  // CREATE PRODUCT
  // =========================================

  const handleCreateProduct =
    async (productData) => {
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
          `${API_BASE_URL}/products`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              productData
            ),
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
            'Failed to create product.'
        )
      }

      await fetchAdminProducts()

      // Refresh customer products too
      await fetchStoreProducts()

      window.alert(
        'Product added successfully.'
      )
    }


  // =========================================
  // UPDATE PRODUCT
  // =========================================

  const handleUpdateProduct =
    async (
      productId,
      productData
    ) => {
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
          `${API_BASE_URL}/products/${productId}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              productData
            ),
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
            'Failed to update product.'
        )
      }

      await fetchAdminProducts()

      // Refresh customer products too
      await fetchStoreProducts()

      window.alert(
        'Product updated successfully.'
      )
    }


  // =========================================
  // DELETE PRODUCT
  // =========================================

  const handleDeleteProduct =
    async (productId) => {
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
          `${API_BASE_URL}/products/${productId}`,
          {
            method: 'DELETE',

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
            'Failed to delete product.'
        )
      }

      await fetchAdminProducts()

      // Refresh customer products too
      await fetchStoreProducts()

      window.alert(
        'Product deleted successfully.'
      )
    }


  // =========================================
  // OPEN ADMIN PRODUCTS
  // =========================================

  const openAdminProducts =
    async () => {
      try {
        await fetchAdminProducts()

        navigateTo(
          'admin-products'
        )
      } catch (error) {
        console.error(
          'Admin Products Error:',
          error
        )

        window.alert(
          error.message ||
            'Unable to load admin products.'
        )
      }
    }


  // =========================================
  // OPEN ADMIN ORDERS
  // =========================================

  const openAdminOrders = () => {
    setSelectedProduct(null)
    setSelectedOrderId(null)
    setCurrentPage('admin-orders')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // =========================================
  // HOME PAGE
  // =========================================

  const renderHome = () => {
    return (
      <>
        {/* =================================
            CATEGORIES
        ================================= */}

        <section
          id="categories"
          className="categories-section"
        >

          <div className="section-heading">

            <p className="section-eyebrow">
              EXPLORE OUR COLLECTION
            </p>

            <h2>
              Lighting For Every Space
            </h2>

            <p>
              Find the perfect light for every
              corner of your home.
            </p>

          </div>


          <div className="category-grid">

            <div
              className="category-card"
              onClick={() => {
                setSearchTerm(
                  'Ceiling Lights'
                )

                navigateTo('products')
              }}
            >

              <div className="category-icon">
                ◉
              </div>

              <h3>
                Ceiling Lights
              </h3>

              <p>
                Modern ceiling lighting
              </p>

            </div>


            <div
              className="category-card"
              onClick={() => {
                setSearchTerm(
                  'Pendant Lights'
                )

                navigateTo('products')
              }}
            >

              <div className="category-icon">
                ◇
              </div>

              <h3>
                Pendant Lights
              </h3>

              <p>
                Elegant hanging lights
              </p>

            </div>


            <div
              className="category-card"
              onClick={() => {
                setSearchTerm(
                  'Wall Lights'
                )

                navigateTo('products')
              }}
            >

              <div className="category-icon">
                ◌
              </div>

              <h3>
                Wall Lights
              </h3>

              <p>
                Beautiful wall illumination
              </p>

            </div>


            <div
              className="category-card"
              onClick={() => {
                setSearchTerm(
                  'Table Lamps'
                )

                navigateTo('products')
              }}
            >

              <div className="category-icon">
                ✦
              </div>

              <h3>
                Table Lamps
              </h3>

              <p>
                Warm ambient lighting
              </p>

            </div>

          </div>

        </section>


        {/* =================================
            PRODUCTS
        ================================= */}

        <section
          id="products"
          className="products-section"
        >

          <div className="section-heading">

            <p className="section-eyebrow">
              FEATURED COLLECTION
            </p>

            <h2>
              Our Popular Lights
            </h2>

            <p>
              Discover lighting designed to make
              your space feel special.
            </p>

          </div>


          {productsLoading ? (

            <div className="no-products">
              <h3>
                Loading products...
              </h3>

              <p>
                Please wait while we load
                our lighting collection.
              </p>
            </div>

          ) : productsError ? (

            <div className="no-products">
              <h3>
                Unable to load products
              </h3>

              <p>
                {productsError}
              </p>

              <button
                type="button"
                className="shop-button"
                onClick={
                  fetchStoreProducts
                }
              >
                Try Again
              </button>
            </div>

          ) : (

            <div className="product-grid">

              {filteredProducts.length ===
              0 ? (

                <div className="no-products">

                  <h3>
                    No products found
                  </h3>

                  <p>
                    Try searching for another
                    lighting product.
                  </p>

                </div>

              ) : (

                filteredProducts.map(
                  (product) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={
                        addToCart
                      }
                      onViewProduct={
                        openProduct
                      }
                      onToggleWishlist={
                        toggleWishlist
                      }
                      isWishlisted={
                        wishlist.some(
                          (item) =>
                            item.id ===
                            product.id
                        )
                      }
                    />

                  )
                )

              )}

            </div>

          )}

        </section>


        {/* =================================
            CART
        ================================= */}

        <Cart
          cart={cart}
          setCart={setCart}
          user={user}
          onLogin={() => {
            navigateTo('auth')
          }}
        />


        {/* =================================
            ABOUT
        ================================= */}

        <section
          id="about"
          className="info-section"
        >

          <div className="section-heading">

            <p className="section-eyebrow">
              ABOUT SHIVORA
            </p>

            <h2>
              Lighting With Purpose
            </h2>

            <p>
              Shivora Lighting brings together
              modern design, warm illumination
              and elegant spaces.
            </p>

          </div>

        </section>


        {/* =================================
            CONTACT
        ================================= */}

        <section
          id="contact"
          className="info-section contact-section"
        >

          <div className="section-heading">

            <p className="section-eyebrow">
              GET IN TOUCH
            </p>

            <h2>
              Contact Shivora Lighting
            </h2>

            <p>
              Have a question about our products?
              Our customer support team will be
              happy to help.
            </p>

          </div>

        </section>

      </>
    )
  }


  // =========================================
  // PRODUCTS PAGE
  // =========================================

  const renderProducts = () => {
    return (
      <section
        id="products"
        className="products-section standalone-page"
      >

        <div className="section-heading">

          <p className="section-eyebrow">
            SHIVORA COLLECTION
          </p>

          <h2>
            All Products
          </h2>

          <p>
            Explore our complete lighting
            collection.
          </p>

        </div>


        {productsLoading ? (

          <div className="no-products">

            <h3>
              Loading products...
            </h3>

            <p>
              Please wait.
            </p>

          </div>

        ) : productsError ? (

          <div className="no-products">

            <h3>
              Unable to load products
            </h3>

            <p>
              {productsError}
            </p>

            <button
              type="button"
              className="shop-button"
              onClick={
                fetchStoreProducts
              }
            >
              Try Again
            </button>

          </div>

        ) : (

          <div className="product-grid">

            {filteredProducts.length ===
            0 ? (

              <div className="no-products">

                <h3>
                  No products found
                </h3>

                <p>
                  Try another search.
                </p>

              </div>

            ) : (

              filteredProducts.map(
                (product) => (

                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={
                      addToCart
                    }
                    onViewProduct={
                      openProduct
                    }
                    onToggleWishlist={
                      toggleWishlist
                    }
                    isWishlisted={
                      wishlist.some(
                        (item) =>
                          item.id ===
                          product.id
                      )
                    }
                  />

                )
              )

            )}

          </div>

        )}

      </section>
    )
  }


  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="app">

      {/* =====================================
          NAVBAR
      ====================================== */}

      <header className="navbar">

        {/* BRAND */}

        <button
          className="brand"
          type="button"
          onClick={() =>
            navigateTo('home')
          }
        >

          <div className="brand-icon">
            ✦
          </div>

          <div className="brand-text">

            <span className="brand-name">
              SHIVORA
            </span>

            <span className="brand-subtitle">
              LIGHTING
            </span>

          </div>

        </button>


        {/* NAV LINKS */}

        <nav className="nav-links">

          <button
            type="button"
            onClick={() =>
              navigateTo('home')
            }
          >
            Home
          </button>


          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              navigateTo('products')
            }}
          >
            Products
          </button>


          <button
            type="button"
            onClick={() => {
              navigateTo('home')

              setTimeout(() => {
                document
                  .getElementById(
                    'categories'
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }, 50)
            }}
          >
            Categories
          </button>


          <button
            type="button"
            onClick={() => {
              navigateTo('home')

              setTimeout(() => {
                document
                  .getElementById(
                    'about'
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }, 50)
            }}
          >
            About
          </button>


          <button
            type="button"
            onClick={() => {
              navigateTo('home')

              setTimeout(() => {
                document
                  .getElementById(
                    'contact'
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }, 50)
            }}
          >
            Contact
          </button>

        </nav>


        {/* NAV ACTIONS */}

        <div className="nav-actions">

          {/* SEARCH */}

          <div className="search-box">

            <FiSearch />

            <input
              type="text"
              placeholder="Search lights..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>


          {/* WISHLIST */}

          <button
            className="wishlist-nav-button"
            type="button"
            aria-label="Wishlist"
            onClick={() => {

              if (user) {
                navigateTo('profile')
                return
              }

              navigateTo('auth')
            }}
          >

            <FiHeart />

            <span className="wishlist-count">
              {wishlist.length}
            </span>

          </button>


          {/* CART */}

          <button
            className="cart-button"
            type="button"
            aria-label="Shopping Cart"
            onClick={() => {

              navigateTo('home')

              setTimeout(() => {
                document
                  .getElementById(
                    'cart'
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }, 50)

            }}
          >

            <FiShoppingCart />

            <span className="cart-count">
              {cartItemCount}
            </span>

          </button>


          {/* ACCOUNT */}

          <button
            className="user-button"
            type="button"
            onClick={
              openAccount
            }
          >

            <FiUser />

            <span>
              {user
                ? user.name
                : 'Login'}
            </span>

          </button>

        </div>

      </header>


      {/* =====================================
          MAIN
      ====================================== */}

      <main>

        {/* PRODUCT DETAILS */}

        {currentPage ===
          'product' &&
          selectedProduct && (
            <ProductDetails
              product={
                selectedProduct
              }
              onBack={
                backToProducts
              }
              onAddToCart={
                addToCart
              }
            />
          )}


        {/* ORDER DETAILS */}

        {currentPage ===
          'order-details' &&
          selectedOrderId && (
            <OrderDetails
              orderId={selectedOrderId}
              onBack={() => {
                setSelectedOrderId(null)
                setCurrentPage('profile')
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }}
            />
          )}


        {/* AUTH */}

        {currentPage ===
          'auth' && (
          <Auth
            onBack={() =>
              navigateTo('home')
            }
            onLoginSuccess={
              handleLoginSuccess
            }
          />
        )}


        {/* USER PROFILE */}

        {currentPage ===
          'profile' &&
          user && (
            <UserProfile
              user={user}
              wishlist={
                wishlist
              }
              orders={[]}
              onBack={() =>
                navigateTo('home')
              }
              onLogout={
                handleLogout
              }
              onViewOrder={
                openOrderDetails
              }
              onRemoveFromWishlist={
                removeFromWishlist
              }
            />
          )}


        {/* ADMIN DASHBOARD */}

        {currentPage ===
          'admin' &&
          user &&
          user.role ===
            'ADMIN' && (
            <AdminDashboard
              user={user}
              products={adminProducts}
              onBack={() =>
                navigateTo('home')
              }
              onLogout={
                handleLogout
              }
              onProducts={
                openAdminProducts
              }
              onOrders={
                openAdminOrders
              }
              onCustomers={() =>
                navigateTo('admin-customers')
              }
              onSettings={() =>
                navigateTo('admin-settings')
              }
            />
          )}


        {/* ADMIN ORDERS */}

        {currentPage ===
          'admin-orders' &&
          user &&
          user.role ===
            'ADMIN' && (
            <AdminOrders
              onBack={() =>
                navigateTo('admin')
              }
            />
          )}


        {/* ADMIN CUSTOMERS */}

        {currentPage ===
          'admin-customers' &&
          user &&
          user.role ===
            'ADMIN' && (
            <AdminCustomers
              user={user}
              onBack={() =>
                navigateTo('admin')
              }
            />
          )}


        {/* ADMIN SETTINGS */}

        {currentPage ===
          'admin-settings' &&
          user &&
          user.role ===
            'ADMIN' && (
            <AdminSettings
              onBack={() =>
                navigateTo('admin')
              }
            />
          )}


        {/* ADMIN PRODUCTS */}

        {currentPage ===
          'admin-products' &&
          user &&
          user.role ===
            'ADMIN' && (
            <AdminProducts
              products={
                adminProducts
              }

              onBack={() =>
                navigateTo(
                  'admin'
                )
              }

              onAddProduct={
                handleCreateProduct
              }

              onUpdateProduct={
                handleUpdateProduct
              }

              onDeleteProduct={
                handleDeleteProduct
              }
            />
          )}


        {/* HOME */}

        {currentPage ===
          'home' &&
          renderHome()}


        {/* PRODUCTS */}

        {currentPage ===
          'products' &&
          renderProducts()}

      </main>

    </div>
  )
}

export default App