import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaSearch, FaCheckCircle, FaTimes } from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'
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
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  createdAt: string
}

const SellerHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const seller = sessionUtils.getUser()
      if (!seller) {
        toast.error('Please login to view order history')
        return
      }

      const sellerId = seller.userId
      const response = await fetch(`http://localhost:8080/api/payment/seller-delivered-orders/${sellerId}`)

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
        // Sort by newest first
        formattedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(formattedOrders)
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
      } else {
        toast.error('Failed to fetch order history')
      }
    } catch (error) {
      console.error('Error fetching order history:', error)
      toast.error('An error occurred while fetching order history')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.customerName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (order.productName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      `#${order.orderId}`.toLowerCase().includes(search.toLowerCase())

    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRemoveOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to remove this order from your history?')) {
      return
    }

    try {
      const seller = sessionUtils.getUser()
      if (!seller) {
        toast.error('Please login to remove orders')
        return
      }

      const sellerId = seller.userId
      const response = await fetch(`http://localhost:8080/api/payment/seller-orders/${orderId}/${sellerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Order removed from history')
        // Remove from local state
        setOrders(orders.filter(order => order.orderId !== orderId))
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to remove order' }))
        toast.error(errorData.message || 'Failed to remove order')
      }
    } catch (error) {
      console.error('Error removing order:', error)
      toast.error('An error occurred while removing order')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading order history...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  History
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Order History</h1>
                  <p className="text-sm text-gray-500">
                    View all your delivered orders from your Local Hunt store.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    type="search"
                    placeholder="Search orders or customers"
                    className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>
            </div>
          </header>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FaCheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Total Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No delivered orders yet</h2>
                <p className="text-gray-600">
                  {search ? 'No orders match your search criteria.' : 'Your delivered orders will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div key={order.orderId} className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
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
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500">Order #{order.orderId}</p>
                            <h3 className="text-lg font-semibold text-gray-900 mt-1">{order.productName}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Delivered on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <FaCheckCircle className="h-3 w-3" />
                              Delivered
                            </span>
                            {order.status === 'Delivered' && (
                              <button
                                onClick={() => handleRemoveOrder(order.orderId)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove from history"
                                aria-label="Remove order from history"
                              >
                                <FaTimes className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                            <p className="text-sm font-medium text-gray-900">{order.customerName || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{order.customerEmail || ''}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                            <p className="text-sm text-gray-900">{order.address}</p>
                            <p className="text-xs text-gray-600">{order.area}, {order.city}, {order.region}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                            <p className="text-sm font-medium text-gray-900">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.paymentMethod === 'esewa' ? 'Online (Esewa)' : 'Cash on Delivery'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-xl font-bold text-emerald-600">NRP {order.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerHistory
