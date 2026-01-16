import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'

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

const COD = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orderData, setOrderData] = useState<PaymentState | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')

  useEffect(() => {
    // Get order data from location state (passed from Payment)
    const state = location.state as { orderData?: PaymentState; paymentMethod?: string } | undefined
    if (state?.orderData) {
      setOrderData(state.orderData)
      setPaymentMethod(state.paymentMethod || 'cod')
    } else {
      // If no order data, redirect to home
      navigate('/')
    }
  }, [location, navigate])

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />

      <section className="py-12 px-4 md:px-10">
        <div className="max-w-4xl mx-auto">
          {/* Thank You Message */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Purchase!</h1>
            <p className="text-gray-600 text-lg">
              Your order has been placed successfully. {paymentMethod === 'cod' ? 'You will pay on delivery.' : 'Your payment is being processed.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {orderData.selectedItems.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
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
                        <h3 className="text-base font-medium text-gray-900 truncate">{item.productName}</h3>
                        {item.sellerName && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sold by: {item.sellerName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-red-600 font-semibold mt-1">
                          NRP {(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{orderData.locationData.address}</p>
                    <p>{orderData.locationData.area}</p>
                    <p>{orderData.locationData.city}, {orderData.locationData.region}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Total</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
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
                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-red-600">NRP {orderData.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full bg-red-400 text-white py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors"
                >
                  Continue Shopping
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

export default COD
