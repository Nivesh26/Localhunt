import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCommentDots,
} from 'react-icons/fa'
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

const statusColors: Record<string, string> = {
  'Pending': 'bg-rose-50 text-rose-700',
  'Processing': 'bg-blue-50 text-blue-700',
  'Ready to ship': 'bg-amber-50 text-amber-700',
  'Shipped': 'bg-blue-50 text-blue-700',
  'Delivered': 'bg-emerald-50 text-emerald-700',
  'Cancelled': 'bg-red-50 text-red-700',
}

const SellerOrder = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<'All' | string>('All')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const seller = sessionUtils.getUser()
      if (!seller) {
        toast.error('Please login to view orders')
        return
      }

      const sellerId = seller.userId
      const response = await fetch(`http://localhost:8080/api/payment/seller-orders/${sellerId}`)

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
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('An error occurred while fetching orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const seller = sessionUtils.getUser()
      if (!seller) {
        toast.error('Please login to update order status')
        return
      }

      const sellerId = seller.userId
      const response = await fetch(`http://localhost:8080/api/payment/orders/${orderId}/status/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Order status updated to "${newStatus}"`)
        fetchOrders() // Refresh orders
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update order status' }))
        toast.error(errorData.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('An error occurred while updating order status')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.customerName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (order.productName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      `#${order.orderId}`.toLowerCase().includes(search.toLowerCase())

    if (activeStatus === 'All') return matchesSearch
    if (activeStatus === 'Issues') return matchesSearch && (order.status === 'Pending' || order.status === 'Processing')
    return matchesSearch && order.status === activeStatus
  })

  const getStatusCount = (status: string) => {
    if (status === 'Issues') {
      return orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length
    }
    return orders.filter(o => o.status === status).length
  }

  const statusFilters = [
    { label: 'All', value: 'All', count: orders.length },
    { label: 'Ready to ship', value: 'Ready to ship', count: getStatusCount('Ready to ship') },
    { label: 'Delivered', value: 'Delivered', count: getStatusCount('Delivered') },
    { label: 'Issues', value: 'Issues', count: getStatusCount('Issues') },
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `Today • ${diffMins}m ago`
    } else if (diffHours < 24) {
      return `Today • ${diffHours}h ago`
    } else if (diffDays === 1) {
      return `Yesterday • ${diffHours - 24}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Orders
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Manage Seller Orders</h1>
                  <p className="text-sm text-gray-500">
                    Track new orders, print packing slips, and update shipping statuses for your Local Hunt store.
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
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FaFilter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <FaCheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Delivered</p>
                    <p className="text-2xl font-semibold text-gray-900">{getStatusCount('Delivered')}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Payout clears in 2 days</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <FaClock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Ready to ship</p>
                    <p className="text-2xl font-semibold text-gray-900">{getStatusCount('Ready to ship')}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Need fulfillment within 24h</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <FaExclamationTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Issues</p>
                    <p className="text-2xl font-semibold text-gray-900">{getStatusCount('Issues')}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Awaiting support response</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setActiveStatus(filter.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    activeStatus === filter.value ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      activeStatus === filter.value ? 'bg-white text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500">Latest orders from your store, updated in real time.</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Address</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">#{order.orderId}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{order.productName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{order.customerName || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{order.customerEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{order.quantity}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">NRP {order.subtotal.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            order.paymentMethod === 'esewa'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.paymentMethod === 'esewa' ? 'Online' : 'Cash on Delivery'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600">{order.address}</p>
                        <p className="text-xs text-gray-500">{order.area}, {order.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-50 text-gray-700'}`}>
                          {order.status === 'Pending' || order.status === 'Processing' 
                            ? 'Your product is preparing' 
                            : order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2 flex-col">
                          {order.status !== 'Ready to ship' && order.status !== 'Delivered' && (
                            <button
                              onClick={() => handleUpdateStatus(order.orderId, 'Ready to ship')}
                              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Mark Ready to Ship
                            </button>
                          )}
                          {order.status !== 'Delivered' && (
                            <button
                              onClick={() => handleUpdateStatus(order.orderId, 'Delivered')}
                              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Mark Delivered
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Navigate to messages page or open message modal
                              toast.info('Message feature coming soon!')
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <FaCommentDots className="h-3 w-3" />
                            Message buyer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                        No orders yet. Your new sales will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerOrder
