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
  region: string
  city: string
  area: string
  address: string
}

interface PaymentState {
  selectedItems: CartItem[]
  locationData: LocationData
  subtotal: number
  tax: number
  total: number
}

type PaymentMethod = 'esewa' | 'cod' | null

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [orderData, setOrderData] = useState<PaymentState | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Get order data from location state (passed from Checkout)
    const state = location.state as PaymentState | undefined
    if (state?.selectedItems && state.selectedItems.length > 0) {
      setOrderData(state)
    } else {
      // If no order data, redirect to cart
      toast.error('No order details found')
      navigate('/cart')
    }
  }, [location, navigate])

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (!orderData) {
      toast.error('Order data not found')
      return
    }

    setProcessing(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to proceed')
        navigate('/login')
        return
      }

      const userId = user.userId

      // Prepare order items
      const orderItems = orderData.selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.productPrice
      }))

      // Create order request
      const orderRequest = {
        items: orderItems,
        paymentMethod: paymentMethod,
        region: orderData.locationData.region,
        city: orderData.locationData.city,
        area: orderData.locationData.area,
        address: orderData.locationData.address
      }

      // Create order in backend
      const orderResponse = await fetch(`http://localhost:8080/api/payment/create-order/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ message: 'Failed to create order' }))
        toast.error(errorData.message || 'Failed to create order')
        return
      }

      // Remove items from cart after successful order
      const cartItemIds = orderData.selectedItems.map(item => item.id)
      for (const cartId of cartItemIds) {
        try {
          await fetch(`http://localhost:8080/api/cart/${userId}/${cartId}`, {
            method: 'DELETE',
          })
        } catch (error) {
          console.error('Error removing item from cart:', error)
        }
      }
      // Dispatch event to update cart count in header
      window.dispatchEvent(new CustomEvent('cartUpdated'))

      // Navigate to COD confirmation page
      navigate('/cod', {
        state: {
          orderData: orderData,
          paymentMethod: paymentMethod
        }
      })
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('An error occurred while processing your payment')
    } finally {
      setProcessing(false)
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading payment...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />

      <section className="py-12 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Payment Options */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Payment Method</h2>
                
                <div className="space-y-4">
                  {/* Esewa Payment Option */}
                  <div
                    onClick={() => setPaymentMethod('esewa')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'esewa'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'esewa'}
                        onChange={() => setPaymentMethod('esewa')}
                        className="w-5 h-5 text-red-500 focus:ring-red-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Esewa</h3>
                          <p className="text-sm text-gray-600">Pay securely with Esewa wallet</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-5 h-5 text-red-500 focus:ring-red-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💰</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600">Pay when you receive your order</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="mt-8">
                  <button
                    onClick={handlePayment}
                    disabled={!paymentMethod || processing}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                      !paymentMethod || processing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-400 text-white hover:bg-red-500'
                    }`}
                  >
                    {processing ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Selected Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {orderData.selectedItems.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b pb-3 last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={item.productImageUrl || '/placeholder.png'}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-red-600 mt-1">
                          NRP {(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{orderData.locationData.address}</p>
                    <p>{orderData.locationData.area}</p>
                    <p>{orderData.locationData.city}, {orderData.locationData.region}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({orderData.selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-semibold">NRP {orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (13%)</span>
                    <span className="font-semibold">NRP {orderData.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-red-600">NRP {orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Payment
