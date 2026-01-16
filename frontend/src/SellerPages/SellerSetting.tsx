import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FaBell,
  FaEnvelope,
  FaKey,
  FaShieldAlt,
  FaUserCircle,
  FaStore,
  FaMoneyBillWave,
  FaTruck,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'
import { sessionUtils } from '../utils/sessionUtils'

const notificationSettings = [
  { id: 'newOrders', label: 'New orders', description: 'Get notified when customers place new orders.' },
  { id: 'messages', label: 'Customer messages', description: 'Alert me when customers send messages or inquiries.' },
  { id: 'payouts', label: 'Payout updates', description: 'Email me when payouts are processed or delayed.' },
  { id: 'reviews', label: 'Product reviews', description: 'Notify me when customers leave reviews or ratings.' },
  { id: 'lowStock', label: 'Low stock alerts', description: 'Warn me when product inventory falls below threshold.' },
  { id: 'system', label: 'System announcements', description: 'Platform updates, maintenance, and new features.' },
]

const SellerSetting = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeStatus, setStoreStatus] = useState<boolean>(true)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    newOrders: true,
    messages: true,
    payouts: true,
    reviews: false,
    lowStock: true,
    system: true,
  })

  const [formData, setFormData] = useState({
    storeName: '',
    businessCategory: '',
    storeDescription: '',
    storeLocation: '',
    businessPanVat: '',
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    processingTime: '1-2 business days',
    returnPolicy: 'We accept returns within 7 days of delivery. Items must be unused and in original packaging.'
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchSellerProfile()
  }, [])

  const fetchSellerProfile = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to view your settings')
        navigate('/sellerlogin')
        return
      }

      const sellerId = user.userId

      // Check if user is a seller
      if (user.role !== 'VENDOR') {
        toast.error('Access denied. This page is for sellers only.')
        navigate('/')
        return
      }

      const response = await fetch(`http://localhost:8080/api/seller/profile/${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          storeName: data.businessName || '',
          businessCategory: data.businessCategory || '',
          storeDescription: data.storeDescription || '',
          storeLocation: data.businessLocation || '',
          businessPanVat: data.businessPanVat || '',
          fullName: data.userName || '',
          phoneNumber: data.phoneNumber || '',
          emailAddress: data.contactEmail || '',
          processingTime: '1-2 business days',
          returnPolicy: 'We accept returns within 7 days of delivery. Items must be unused and in original packaging.'
        })
        setStoreStatus(data.storeStatus !== false) // Default to true if null/undefined
      } else if (response.status === 404) {
        // Seller was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/sellerlogin')
      } else {
        toast.error('Failed to fetch seller profile')
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error)
      toast.error('An error occurred while fetching your profile')
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleToggleStoreStatus = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to toggle store status')
        navigate('/sellerlogin')
        return
      }

      const sellerId = user.userId
      setTogglingStatus(true)

      const response = await fetch(`http://localhost:8080/api/seller/toggle-store-status/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStoreStatus(data.storeStatus !== false)
        toast.success(data.storeStatus ? 'Store is now live!' : 'Store has been paused')
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/sellerlogin')
      } else {
        toast.error('Failed to toggle store status')
      }
    } catch (error) {
      console.error('Error toggling store status:', error)
      toast.error('An error occurred while toggling store status')
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // For phone number, only allow digits and limit to 10
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
      setFormData(prev => ({ ...prev, [name]: digitsOnly }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required'
    }

    if (!formData.businessCategory) {
      newErrors.businessCategory = 'Business category is required'
    }

    // Store description is optional, but if provided, validate
    // (Removed required validation for storeDescription as per user requirement)

    if (!formData.storeLocation.trim()) {
      newErrors.storeLocation = 'Store location is required'
    }

    if (!formData.businessPanVat.trim()) {
      newErrors.businessPanVat = 'PAN / VAT ID is required'
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required'
    } else if (!validateEmail(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setSaving(true)
      try {
        const user = sessionUtils.getUser()
        if (!user) {
          toast.error('Please login to save settings')
          navigate('/sellerlogin')
          return
        }

        const sellerId = user.userId

        const response = await fetch(`http://localhost:8080/api/seller/settings/${sellerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            contactEmail: formData.emailAddress.trim(),
            location: formData.storeLocation.trim(),
            businessName: formData.storeName.trim(),
            businessCategory: formData.businessCategory,
            businessPanVat: formData.businessPanVat.trim(),
            businessLocation: formData.storeLocation.trim(),
            storeDescription: formData.storeDescription.trim() || ''
          }),
        })

        if (response.ok) {
          toast.success('Settings saved successfully!')
        } else if (response.status === 404) {
          // Seller was deleted from database
          sessionUtils.clearSession()
          toast.error('Your account has been deleted. Please contact support.')
          navigate('/sellerlogin')
        } else {
          const errorMessage = await response.text()
          toast.error(errorMessage || 'Failed to save settings')
        }
      } catch (error) {
        console.error('Error saving settings:', error)
        toast.error('An error occurred while saving your settings')
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
          <SellerNavbar />
          <main className="flex-1 space-y-8">
            <div className="flex justify-center items-center min-h-[60vh]">
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white px-6 py-6 shadow-sm sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Store settings</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">Manage Your Store</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Update your store information, security preferences, and notification settings to keep your Local Hunt shop running smoothly.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => fetchSellerProfile()}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={saving || loading}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              {/* Store Information */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-red-50 p-3">
                    <FaStore className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Store information</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your business details that customers see on your storefront.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Store name</label>
                        <input
                          type="text"
                          name="storeName"
                          value={formData.storeName}
                          onChange={handleChange}
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.storeName ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Business category</label>
                        <select
                          name="businessCategory"
                          value={formData.businessCategory}
                          onChange={handleChange}
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.businessCategory ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        >
                          <option>Handmade & Crafts</option>
                          <option>Fashion & Apparel</option>
                          <option>Gourmet & Organic</option>
                          <option>Home & Living</option>
                          <option>Other</option>
                        </select>
                        {errors.businessCategory && <p className="text-red-500 text-xs mt-1">{errors.businessCategory}</p>}
                      </div>
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Store description</label>
                        <textarea
                          name="storeDescription"
                          value={formData.storeDescription}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Describe your store (optional)"
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.storeDescription ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.storeDescription && <p className="text-red-500 text-xs mt-1">{errors.storeDescription}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Store location</label>
                        <input
                          type="text"
                          name="storeLocation"
                          value={formData.storeLocation}
                          onChange={handleChange}
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.storeLocation ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.storeLocation && <p className="text-red-500 text-xs mt-1">{errors.storeLocation}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Business PAN / VAT ID</label>
                        <input
                          type="text"
                          name="businessPanVat"
                          value={formData.businessPanVat}
                          onChange={handleChange}
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.businessPanVat ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.businessPanVat && <p className="text-red-500 text-xs mt-1">{errors.businessPanVat}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <FaUserCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Profile details</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Keep your contact information up to date for order communications and support.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Full name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Phone number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="10 digits only"
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.phoneNumber ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                      </div>
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Email address</label>
                        <input
                          type="email"
                          name="emailAddress"
                          value={formData.emailAddress}
                          onChange={handleChange}
                          className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.emailAddress ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                          }`}
                        />
                        {errors.emailAddress && <p className="text-red-500 text-xs mt-1">{errors.emailAddress}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & Policies - Hidden */}
              {false && (
                <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <FaTruck className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">Shipping & policies</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Configure shipping options and return policies for your store.
                      </p>

                      <div className="mt-6 space-y-5">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">Processing time</label>
                          <select
                            name="processingTime"
                            value={formData.processingTime}
                            onChange={handleChange}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                          >
                            <option>1-2 business days</option>
                            <option>2-3 business days</option>
                            <option>3-5 business days</option>
                            <option>5-7 business days</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">Return policy</label>
                          <textarea
                            name="returnPolicy"
                            value={formData.returnPolicy}
                            onChange={handleChange}
                            rows={3}
                            className={`rounded-xl border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                              errors.returnPolicy ? 'border-red-500' : 'border-gray-200 focus:border-red-400'
                            }`}
                          />
                          {errors.returnPolicy && <p className="text-red-500 text-xs mt-1">{errors.returnPolicy}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-50 p-3">
                    <FaShieldAlt className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Protect your account with strong passwords.
                    </p>

                    <div className="mt-6 space-y-5">
                      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <FaKey className="mt-0.5 h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Change password</p>
                            <p className="text-sm text-gray-500">
                              Update your password to keep your account secure.
                            </p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/sellerchangepassword')} className="self-start rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              {/* Notifications - Hidden */}
              {false && (
                <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-yellow-50 p-3">
                      <FaBell className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">Notification preferences</h2>
                      <p className="mt-1 text-sm text-gray-500">Choose how you get alerted about store activity.</p>

                      <div className="mt-6 space-y-4">
                        {notificationSettings.map(option => (
                          <div
                            key={option.id}
                            className="flex gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-red-200"
                          >
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 p-2">
                              <FaEnvelope className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                            <button
                              onClick={() => toggleNotification(option.id)}
                              className={`h-7 rounded-full px-3 text-xs font-semibold transition ${
                                notifications[option.id]
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {notifications[option.id] ? 'On' : 'Off'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <FaMoneyBillWave className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Payment settings</h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Manage your bank account and payout preferences.
                    </p>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Bank account</p>
                          <p className="text-xs text-gray-500">****1234 • Nabil Bank</p>
                        </div>
                        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Payout schedule</p>
                          <p className="text-xs text-gray-500">Weekly (Every Friday)</p>
                        </div>
                        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Status */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900">Store status</h2>
                <p className="mt-2 text-sm text-gray-500">
                  {storeStatus 
                    ? 'Your store is currently active and visible to customers.'
                    : 'Your store is currently paused. Products will not be visible to customers.'}
                </p>
                <div className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  storeStatus 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    storeStatus ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-semibold ${
                    storeStatus ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {storeStatus ? 'Store is live' : 'Store is off'}
                  </span>
                </div>
                <button 
                  onClick={handleToggleStoreStatus}
                  disabled={togglingStatus}
                  className={`mt-4 w-full rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    storeStatus
                      ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'border-red-200 text-red-700 hover:bg-red-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {togglingStatus 
                    ? 'Processing...' 
                    : storeStatus 
                      ? 'Temporarily pause store' 
                      : 'Resume store'}
                </button>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerSetting
