import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { sessionUtils } from '../utils/sessionUtils'

interface Order {
  orderId: number
  productId: number
  productName: string
  productImageUrl: string
  quantity: number
  unitPrice: number
  subtotal: number
  paymentMethod: string
  status: string
  region: string
  city: string
  area: string
  address: string
  sellerName?: string
  createdAt: string
}

const OrderTracking = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to view your orders')
        navigate('/login')
        return
      }

      const userId = user.userId
      const response = await fetch(`http://localhost:8080/api/payment/orders/${userId}`)

      if (response.ok) {
        const data = await response.json()
        // Convert imageUrl paths to full URLs
        const formattedOrders: Order[] = data.map((order: any) => {
          let imageUrl = order.productImageUrl || ''
          if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = `http://localhost:8080${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
          }
          return {
            ...order,
            productImageUrl: imageUrl
          }
        })
        setOrders(formattedOrders)
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('An error occurred while fetching orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Processing': 'bg-blue-100 text-blue-700',
      'Shipped': 'bg-purple-100 text-purple-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading your orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />

      <section className="py-12 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Purchase</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate('/shop')}
                className="bg-red-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={order.productImageUrl || '/placeholder.png'}
                        alt={order.productName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png'
                        }}
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{order.productName}</h3>
                          {order.sellerName && (
                            <p className="text-sm text-gray-500 mb-2">
                              Sold by: <span className="font-medium">{order.sellerName}</span>
                            </p>
                          )}
                          <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                          <p className="text-red-600 font-bold text-lg mt-2">
                            NRP {order.subtotal.toFixed(2)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status === 'Pending' || order.status === 'Processing' 
                            ? 'Your product is preparing' 
                            : order.status}
                        </span>
                      </div>

                      {/* Delivery Address */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Delivery Address:</p>
                        <p className="text-sm text-gray-600">
                          {order.address}, {order.area}, {order.city}, {order.region}
                        </p>
                      </div>

                      {/* Payment Method */}
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Payment Method:</span>{' '}
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Esewa'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Order Date:</span>{' '}
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default OrderTracking
