import { useEffect, useState } from 'react'
import {
  FiArrowLeft,
  FiSettings,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi'

const API_BASE_URL = 'http://localhost:5000/api'

const DEFAULT_SETTINGS = {
  storeName: 'Shivora Lighting',
  email: 'admin@shivora.com',
  mobile: '9999999999',
  theme: 'Slate & Pearl',
  currency: 'INR',
  storeStatus: 'Open',
}

function AdminSettings({
  onBack,
  onSettingsSaved,
}) {
  const [formData, setFormData] =
    useState(DEFAULT_SETTINGS)

  const [originalData, setOriginalData] =
    useState(DEFAULT_SETTINGS)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')

  const token =
    localStorage.getItem('shivora_token')

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_BASE_URL}/settings`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to load store settings.'
        )
      }

      const settings = {
        ...DEFAULT_SETTINGS,
        ...data.settings,
      }

      setFormData(settings)
      setOriginalData(settings)

      if (onSettingsSaved) {
        onSettingsSaved(settings)
      }
    } catch (loadError) {
      console.error(
        'Store Settings Load Error:',
        loadError
      )

      setError(
        loadError.message ||
          'Unable to load store settings.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
    // Settings are loaded once when this admin page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
    setMessage('')
  }

  const handleCancel = () => {
    setFormData(originalData)
    setError('')
    setMessage('')
    onBack()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    const cleanName =
      formData.storeName.trim()

    const cleanEmail =
      formData.email.trim().toLowerCase()

    const cleanMobile =
      formData.mobile.trim()

    if (!cleanName) {
      setError('Store name is required.')
      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        'Please enter a valid store email.'
      )
      return
    }

    if (
      !/^\+?[0-9][0-9\s-]{7,19}$/.test(
        cleanMobile
      )
    ) {
      setError(
        'Please enter a valid store mobile number.'
      )
      return
    }

    if (!token) {
      setError(
        'Admin login session is missing. Please login again.'
      )
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storeName: cleanName,
            email: cleanEmail,
            mobile: cleanMobile,
            currency: formData.currency,
            theme: formData.theme,
            storeStatus: formData.storeStatus,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          throw new Error(
            'Your admin session has expired. Please login again.'
          )
        }

        if (response.status === 403) {
          throw new Error(
            'Only an administrator can update store settings.'
          )
        }

        throw new Error(
          data.message ||
            'Unable to save store settings.'
        )
      }

      const savedSettings = {
        ...DEFAULT_SETTINGS,
        ...data.settings,
      }

      setFormData(savedSettings)
      setOriginalData(savedSettings)
      setMessage(
        'Store settings updated successfully.'
      )

      if (onSettingsSaved) {
        onSettingsSaved(savedSettings)
      }
    } catch (saveError) {
      console.error(
        'Store Settings Save Error:',
        saveError
      )

      setError(
        saveError.message ||
          'Unable to save store settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="admin-products-section">
        <div className="admin-page-header">
          <div>
            <p className="section-eyebrow">
              STORE CONFIGURATION
            </p>
            <h1>Store Settings</h1>
            <p>
              Loading current store configuration...
            </p>
          </div>

          <button
            type="button"
            className="admin-back-button"
            onClick={onBack}
          >
            <FiArrowLeft />
            Dashboard
          </button>
        </div>

        <div className="admin-settings-status-card">
          <FiRefreshCw />
          <span>
            Reading settings from MySQL...
          </span>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-products-section">
      <div className="admin-page-header">
        <div>
          <p className="section-eyebrow">
            STORE CONFIGURATION
          </p>

          <h1>Store Settings</h1>

          <p>
            Manage Shivora Lighting store
            information and configuration.
          </p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={onBack}
          disabled={saving}
        >
          <FiArrowLeft />
          Dashboard
        </button>
      </div>

      {error && (
        <div className="admin-settings-error">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-settings-success">
          {message}
        </div>
      )}

      <form
        className="admin-product-form"
        onSubmit={handleSubmit}
      >
        <div className="admin-form-section">
          <div className="admin-form-section-heading">
            <FiSettings />

            <div>
              <h2>Store Information</h2>

              <p>
                Changes are saved to MySQL and
                remain available after refresh.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="storeName">
                Store Name
              </label>

              <input
                id="storeName"
                name="storeName"
                type="text"
                value={formData.storeName}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="email">
                Store Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={190}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="mobile">
                Store Mobile
              </label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                inputMode="tel"
                maxLength={20}
                placeholder="+91 9999999999"
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="currency">
                Currency
              </label>

              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="INR">
                  INR (₹)
                </option>
                <option value="USD">
                  USD ($)
                </option>
                <option value="EUR">
                  EUR (€)
                </option>
                <option value="GBP">
                  GBP (£)
                </option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="theme">
                Store Theme
              </label>

              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="Slate & Pearl">
                  Slate & Pearl
                </option>
                <option value="Midnight Luxe">
                  Midnight Luxe
                </option>
                <option value="Sage Modern">
                  Sage Modern
                </option>
                <option value="Warm Minimal">
                  Warm Minimal
                </option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="storeStatus">
                Store Status
              </label>

              <select
                id="storeStatus"
                name="storeStatus"
                value={formData.storeStatus}
                onChange={handleChange}
              >
                <option value="Open">
                  Open
                </option>
                <option value="Maintenance">
                  Maintenance
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-back-button"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-add-button"
            disabled={saving}
          >
            <FiSave />

            {saving
              ? 'Saving...'
              : 'Save Settings'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminSettings
