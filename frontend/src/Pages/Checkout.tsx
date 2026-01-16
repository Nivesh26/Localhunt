import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { sessionUtils } from '../utils/sessionUtils'

interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  productImageUrl: string
  quantity: number
  subtotal: number
  sellerName?: string
}

interface LocationData {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locationData, setLocationData] = useState<LocationData>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal'
  })
  const [errors, setErrors] = useState<Partial<LocationData>>({})

  useEffect(() => {
    // Get selected items from location state (passed from Cart)
    const state = location.state as { selectedItems?: CartItem[] }
    if (state?.selectedItems && state.selectedItems.length > 0) {
      setSelectedItems(state.selectedItems)
      // Load existing user location if available
      loadUserLocation()
    } else {
      // If no items, redirect to cart
      toast.error('No items selected for checkout')
      navigate('/cart')
    }
  }, [location, navigate])

  const loadUserLocation = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const userId = user.userId
      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        // Pre-fill location if user has saved address
        if (data.addressLine1 || data.city) {
          setLocationData({
            addressLine1: data.addressLine1 || '',
            addressLine2: data.addressLine2 || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
            country: data.country || 'Nepal'
          })
        }
      }
    } catch (error) {
      console.error('Error loading user location:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<LocationData> = {}

    if (!locationData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }

    if (!locationData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!locationData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!locationData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    }

    if (!locationData.country.trim()) {
      newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setLocationData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required address fields')
      return
    }

    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to proceed')
        navigate('/login')
        return
      }

      const userId = user.userId

      const response = await fetch(`http://localhost:8080/api/auth/location/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      })

      if (response.ok) {
        toast.success('Address saved successfully!')
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
      } else {
        toast.error('Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('An error occurred while saving address')
    }
  }

  const handleProceedToPay = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required address fields')
      return
    }

    // Save address first
    setSaving(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to proceed')
        navigate('/login')
        return
      }

      const userId = user.userId

      const response = await fetch(`http://localhost:8080/api/auth/location/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      })

      if (response.ok) {
        // Address saved, proceed to payment
        toast.success('Proceeding to payment...')
        // TODO: Implement payment integration
        // For now, just show success message
        setTimeout(() => {
          toast.success('Order placed successfully! (Payment integration pending)')
          navigate('/cart')
        }, 1000)
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
      } else {
        toast.error('Failed to save address')
      }
    } catch (error) {
      console.error('Error proceeding to payment:', error)
      toast.error('An error occurred while processing your order')
    } finally {
      setSaving(false)
    }
  }

  const getSubtotal = () => {
    return selectedItems.reduce((total, item) => total + item.productPrice * item.quantity, 0)
  }

  const getTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.08
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading checkout...</div>
      </div>
    )
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No items selected</h2>
          <button
            onClick={() => navigate('/cart')}
            className="bg-red-400 text-white px-6 py-2 rounded-lg hover:bg-red-500"
          >
            Go to Cart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />

      <section className="py-12 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Delivery Address and Products */}
            <div className="md:col-span-2 space-y-6">
              {/* Delivery Address Form */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={locationData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                        errors.addressLine1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      }`}
                      placeholder="Street address, P.O. Box"
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={locationData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={locationData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                          errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                        }`}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={locationData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                          errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                        }`}
                        placeholder="State/Province"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={locationData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                          errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                        }`}
                        placeholder="Postal Code"
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={locationData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                          errors.country ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                        }`}
                        placeholder="Country"
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Address Button */}
                <div className="mt-6">
                  <button
                    onClick={handleSaveAddress}
                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
                <div className="space-y-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={item.productImageUrl || '/placeholder.png'}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png'
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{item.productName}</h3>
                        {item.sellerName && (
                          <p className="text-gray-500 text-sm mt-1">
                            Shipped by: <span className="font-medium">{item.sellerName}</span>
                          </p>
                        )}
                        <p className="text-gray-600 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-red-600 font-bold text-lg mt-1">
                          NRP {(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Items ({getTotalItems()})</span>
                    <span className="font-semibold">NRP {getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">NRP {getTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-red-600">NRP {getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPay}
                  disabled={saving}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors mb-4 ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-400 text-white hover:bg-red-500'
                  }`}
                >
                  {saving ? 'Processing...' : 'Proceed to Pay'}
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-gray-100 text-gray-900 py-4 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Checkout
