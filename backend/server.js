const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

require('dotenv').config()

const {
  testDatabaseConnection,
} = require('./config/db')

const authRoutes =
  require('./routes/authRoutes')

const verificationRoutes =
  require('./routes/verificationRoutes')

const productRoutes =
  require('./routes/productRoutes')

const orderRoutes =
  require('./routes/orderRoutes')

const userRoutes =
  require('./routes/userRoutes')

const settingsRoutes =
  require('./routes/settingsRoutes')

const {
  ensureSettingsTable,
} = require('./controllers/settingsController')

const app = express()

const PORT =
  process.env.PORT || 5000


// =========================================
// CORS
// =========================================

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)


// =========================================
// REQUEST BODY PARSING
// =========================================

app.use(
  express.json()
)

app.use(
  express.urlencoded({
    extended: true,
  })
)


// =========================================
// STATIC FILES
// =========================================
//
// Files inside:
//
// backend/public/
//
// are available through:
//
// http://localhost:5000/
//
// Example:
//
// backend/public/products/prismara-wall-light.jpg
//
// Browser:
//
// http://localhost:5000/products/prismara-wall-light.jpg
// =========================================

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
)


// =========================================
// PRODUCT IMAGE ROUTE
// =========================================
//
// This also supports:
//
// http://localhost:5000/products/prismara-wall-light
//
// It automatically looks for:
//
// backend/public/products/prismara-wall-light.jpg
// =========================================

app.get(
  '/products/:slug',
  (req, res) => {

    const imagePath = path.join(
      __dirname,
      'public',
      'products',
      `${req.params.slug}.jpg`
    )

    console.log(
      'Product image requested:',
      req.params.slug
    )

    console.log(
      'Looking for image:',
      imagePath
    )

    if (!fs.existsSync(imagePath)) {

      console.log(
        'Product image NOT FOUND:',
        imagePath
      )

      return res.status(404).json({
        success: false,
        message: 'Product image not found.',
        image: req.params.slug,
      })
    }

    console.log(
      'Product image FOUND:',
      imagePath
    )

    res.sendFile(imagePath)
  }
)


// =========================================
// AUTH API ROUTES
// =========================================
//
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me
// =========================================

app.use(
  '/api/auth',
  authRoutes
)

app.use(
  '/api/verification',
  verificationRoutes
)


// =========================================
// PRODUCT API ROUTES
// =========================================
//
// GET    /api/products
// POST   /api/products
// PUT    /api/products/:id
// DELETE /api/products/:id
//
// GET is public.
//
// POST, PUT and DELETE are protected
// inside productRoutes.js.
// =========================================

app.use(
  '/api/products',
  productRoutes
)


// =========================================
// ORDER API ROUTES
// =========================================

app.use(
  '/api/orders',
  orderRoutes
)


// =========================================
// USER API ROUTES
// =========================================

app.use(
  '/api/users',
  userRoutes
)

// =========================================
// STORE SETTINGS API ROUTES
// =========================================

app.use(
  '/api/settings',
  settingsRoutes
)


// =========================================
// HOME / SERVER HEALTH CHECK
// =========================================

app.get(
  '/',
  (req, res) => {

    res.send(`
      <!DOCTYPE html>

      <html lang="en">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          Shivora Lighting Backend
        </title>

      </head>

      <body
        style="
          font-family: Arial, sans-serif;
          padding: 40px;
        "
      >

        <h1>
          Shivora Lighting Backend
        </h1>

        <p>
          Server is running successfully.
        </p>

        <p>
          Database:
          ${process.env.DB_NAME}
        </p>

        <h2>
          Available API
        </h2>

        <ul>

          <li>
            GET /api/products
          </li>

          <li>
            POST /api/products
          </li>

          <li>
            PUT /api/products/:id
          </li>

          <li>
            DELETE /api/products/:id
          </li>

          <li>
            POST /api/auth/register
          </li>

          <li>
            POST /api/auth/login
          </li>

          <li>
            GET /api/auth/me
          </li>

          <li>
            GET /api/settings
          </li>

          <li>
            PUT /api/settings
          </li>

          <li>
            GET /products/:slug
          </li>

        </ul>

      </body>

      </html>
    `)
  }
)


// =========================================
// 404 HANDLER
// =========================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        'API endpoint or page not found.',

      path: req.originalUrl,

    })
  }
)


// =========================================
// START SERVER
// =========================================

async function startServer() {

  try {

    await testDatabaseConnection()
    await ensureSettingsTable()

    app.listen(
      PORT,
      () => {

        console.log(
          '================================='
        )

        console.log(
          'Shivora Lighting Backend Started!'
        )

        console.log(
          `Server: http://localhost:${PORT}`
        )

        console.log(
          `Products API: http://localhost:${PORT}/api/products`
        )

        console.log(
          `Auth API: http://localhost:${PORT}/api/auth`
        )

        console.log(
          `Database: ${process.env.DB_NAME}`
        )

        console.log(
          `Product Images: http://localhost:${PORT}/products/:slug`
        )

        console.log(
          '================================='
        )

      }
    )

  } catch (error) {

    console.error(
      'Server startup failed:',
      error.message
    )

    process.exit(1)

  }
}

startServer()