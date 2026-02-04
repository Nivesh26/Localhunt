import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { sessionUtils } from '../utils/sessionUtils'
import { nepalRegions, nepalCities, nepalAreas } from '../data/nepalAddressData'

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
  region: string
  city: string
  area: string
  address: string
}

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locationData, setLocationData] = useState<LocationData>({
    region: '',
    city: '',
    area: '',
    address: ''
  })
  const [errors, setErrors] = useState<Partial<LocationData>>({})
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableAreas, setAvailableAreas] = useState<string[]>([])

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
        if (data.region || data.city) {
          setLocationData({
            region: data.region || '',
            city: data.city || '',
            area: data.area || '',
            address: data.address || ''
          })
          // Update available cities and areas based on saved region
          if (data.region) {
            setAvailableCities(nepalCities[data.region] || [])
            if (data.city) {
              setAvailableAreas(nepalAreas[data.region]?.[data.city] || [])
            }
          }
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

    if (!locationData.region.trim()) {
      newErrors.region = 'Region is required'
    }

    if (!locationData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!locationData.area.trim()) {
      newErrors.area = 'Area is required'
    }

    if (!locationData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegionChange = (region: string) => {
    setLocationData({
      region: region,
      city: '',
      area: '',
      address: locationData.address
    })
    setAvailableCities(nepalCities[region] || [])
    setAvailableAreas([])
  }

  const handleCityChange = (city: string) => {
    setLocationData({
      ...locationData,
      city: city,
      area: '',
      address: locationData.address
    })
    setAvailableAreas(nepalAreas[locationData.region]?.[city] || [])
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
        toast.success('Profile updated')
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
        // Address saved, proceed to payment (no toast - user is going to payment page)
        navigate('/payment', {
          state: {
            selectedItems: selectedItems,
            locationData: locationData,
            subtotal: getSubtotal(),
            tax: getTax(),
            total: getTotal()
          }
        })
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
    return getSubtotal() * 0.13
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

      <section className="py-8 md:py-12 px-4 sm:px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Delivery Address and Products */}
            <div className="md:col-span-2 space-y-6">
              {/* Delivery Address Form */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  {/* Region Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={locationData.region}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                        errors.region ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      }`}
                    >
                      <option value="">Select Region</option>
                      {nepalRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    {errors.region && (
                      <p className="text-red-500 text-xs mt-1">{errors.region}</p>
                    )}
                  </div>

                  {/* City Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={locationData.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={!locationData.region}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                        errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      } ${!locationData.region ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select City</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* Area/Ward Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (Ward) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={locationData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      disabled={!locationData.city}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                        errors.area ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      } ${!locationData.city ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Area/Ward</option>
                      {availableAreas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="text-red-500 text-xs mt-1">{errors.area}</p>
                    )}
                  </div>

                  {/* Address Text Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={locationData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                        errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      }`}
                      placeholder="Street address, house number, landmark, etc."
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
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
                    <span>Tax (13%)</span>
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
