import { useState } from 'react'

function Auth({
  onBack,
  onLoginSuccess,
}) {
  const [isLogin, setIsLogin] =
    useState(true)

  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    })

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setMessage('')

    // =================================
    // LOGIN
    // =================================

   if (isLogin) {
  try {
    setLoading(true)

    const response = await fetch(
      'http://localhost:5000/api/auth/login',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          email: formData.email,
          password:
            formData.password,
        }),
      }
    )

    const data =
      await response.json()

    if (!response.ok) {
      setMessage(
        data.message ||
          'Login failed.'
      )

      return
    }

    // Save JWT
    localStorage.setItem(
  'shivora_token',
  data.token
)

localStorage.setItem(
  'shivora_user',
  JSON.stringify(data.user)
)

setMessage(
  'Login successful.'
)

console.log(
  'Logged in user:',
  data.user
)

// Tell App.jsx that login was successful
if (onLoginSuccess) {
  onLoginSuccess(data.user)
}

  } catch (error) {
    console.error(
      'Login Error:',
      error
    )

    setMessage(
      'Unable to connect to the backend server.'
    )

  } finally {
    setLoading(false)
  }

  return
}

    // =================================
    // REGISTER
    // =================================

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage(
        'Passwords do not match.'
      )

      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            password:
              formData.password,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            'Account creation failed.'
        )

        return
      }

      setMessage(
        'Account created successfully.'
      )

      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        setIsLogin(true)

        setMessage(
          'Account created successfully. Please login.'
        )
      }, 1000)

    } catch (error) {
      console.error(
        'Registration Error:',
        error
      )

      setMessage(
        'Unable to connect to the backend server.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-section">

      <div className="auth-container">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* AUTH CARD */}

        <div className="auth-card">

          <div className="auth-header">

            <h1>
              {isLogin
                ? 'Welcome Back'
                : 'Create Your Account'}
            </h1>

            <p>
              {isLogin
                ? 'Login to your Shivora Lighting account.'
                : 'Create your Shivora Lighting account.'}
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            {!isLogin && (
              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

              </div>
            )}

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>

            {/* MOBILE */}

            {!isLogin && (
              <div className="form-group">

                <label htmlFor="mobile">
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  required
                />

              </div>
            )}

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

            </div>

            {/* CONFIRM PASSWORD */}

            {!isLogin && (
              <div className="form-group">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />

              </div>
            )}

            {/* MESSAGE */}

            {message && (
              <p className="auth-message">
                {message}
              </p>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
  ? isLogin
    ? 'Logging in...'
    : 'Creating Account...'
  : isLogin
  ? 'Login'
  : 'Create Account'}
            </button>

          </form>

          {/* SWITCH */}

          <div className="auth-switch">

            {isLogin ? (
              <p>
                Don't have an account?{' '}

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false)
                    setMessage('')
                  }}
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true)
                    setMessage('')
                  }}
                >
                  Login
                </button>
              </p>
            )}

          </div>

        </div>

      </div>

    </section>
  )
}

export default Auth