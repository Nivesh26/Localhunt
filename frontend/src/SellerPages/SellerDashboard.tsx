import { useState, useEffect } from 'react'
import {
  FaMoneyBillWave,
  FaCube,
  FaShoppingBag,
  FaStar,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'
import { sessionUtils } from '../utils/sessionUtils'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: string
}

interface Order {
  orderId: number
  productName: string
  quantity: number
  subtotal: number
  status: string
  customerName?: string
  createdAt: string
}

interface TopProduct {
  name: string
  sku: string
  price: string
  sold: number
  stock: number
  trend: string
}

interface RecentOrder {
  id: string
  productName: string
  customer: string
  items: number
  total: string
  status: string
  time: string
}

const SellerDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [liveProductsCount, setLiveProductsCount] = useState(0)
  const [orders30Days, setOrders30Days] = useState(0)
  const [payoutReady, setPayoutReady] = useState(0)
  const [storeRating, setStoreRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to view dashboard')
        navigate('/sellerlogin')
        return
      }

      const sellerId = user.userId

      // Fetch all data in parallel
      const [productsResponse, ordersResponse, deliveredOrdersResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/products/seller/${sellerId}`),
        fetch(`http://localhost:8080/api/payment/seller-orders/${sellerId}`),
        fetch(`http://localhost:8080/api/payment/seller-delivered-orders/${sellerId}`)
      ])

      // Process products
      if (productsResponse.ok) {
        const products: Product[] = await productsResponse.json()
        const liveProducts = products.filter(p => p.status === 'Live')
        setLiveProductsCount(liveProducts.length)

        // Calculate top products (by quantity sold)
        const productSales = new Map<number, { product: Product; sold: number }>()
        
        if (ordersResponse.ok) {
          const orders: Order[] = await ordersResponse.json()
          
          // Count sales for each product
          orders.forEach(order => {
            const product = products.find(p => p.name === order.productName)
            if (product) {
              const existing = productSales.get(product.id) || { product, sold: 0 }
              existing.sold += order.quantity
              productSales.set(product.id, existing)
            }
          })

          // Get top 3 products
          const topProductsList = Array.from(productSales.values())
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 3)
            .map(item => ({
              name: item.product.name,
              sku: item.product.sku,
              price: `NRP ${item.product.price.toFixed(2)}`,
              sold: item.sold,
              stock: item.product.stock,
              trend: `+${Math.floor(Math.random() * 20 + 5)}%` // Placeholder for trend
            }))
          setTopProducts(topProductsList)

          // Calculate orders in last 30 days
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const recentOrdersList = orders.filter(order => 
            new Date(order.createdAt) >= thirtyDaysAgo
          )
          setOrders30Days(recentOrdersList.length)

          // Get recent orders (latest 3)
          const sortedOrders = orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map(order => {
              const timeAgo = getTimeAgo(new Date(order.createdAt))
              return {
                id: `#S-${order.orderId}`,
                productName: order.productName || 'Product',
                customer: order.customerName || 'Customer',
                items: order.quantity,
                total: `NRP ${order.subtotal.toFixed(2)}`,
                status: order.status,
                time: timeAgo
              }
            })
          setRecentOrders(sortedOrders)
        }

        // Calculate store rating from product reviews
        const reviewPromises = liveProducts.map(product => 
          fetch(`http://localhost:8080/api/reviews/product/${product.id}/average-rating`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        )

        const reviewResults = await Promise.all(reviewPromises)
        const validRatings = reviewResults
          .filter(r => r && r.hasReviews && r.averageRating !== null)
          .map(r => r.averageRating)
        
        if (validRatings.length > 0) {
          const averageRating = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
          setStoreRating(averageRating)
          
          // Get total review count
          const reviewCountPromises = liveProducts.map(product =>
            fetch(`http://localhost:8080/api/reviews/product/${product.id}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          )
          const allReviews = await Promise.all(reviewCountPromises)
          const totalReviews = allReviews.reduce((sum, reviews) => sum + reviews.length, 0)
          setReviewCount(totalReviews)
        }
      }

      // Calculate payout ready (sum of delivered orders)
      if (deliveredOrdersResponse.ok) {
        const deliveredOrders: Order[] = await deliveredOrdersResponse.json()
        const totalPayout = deliveredOrders.reduce((sum, order) => sum + order.subtotal, 0)
        setPayoutReady(totalPayout)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }

  const statCards = [
    { 
      label: 'Live products', 
      value: liveProductsCount.toString(), 
      change: 'Active listings', 
      icon: FaCube, 
      color: 'bg-red-500' 
    },
    { 
      label: 'Orders (30 days)', 
      value: orders30Days.toString(), 
      change: 'Recent orders', 
      icon: FaShoppingBag, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Payout ready', 
      value: `NRP ${payoutReady.toFixed(2)}`, 
      change: 'From delivered orders', 
      icon: FaMoneyBillWave, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Store rating', 
      value: storeRating > 0 ? storeRating.toFixed(1) : '0.0', 
      change: reviewCount > 0 ? `Based on ${reviewCount} reviews` : 'No reviews yet', 
      icon: FaStar, 
      color: 'bg-blue-500' 
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
          <SellerNavbar />
          <main className="flex-1">
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
        <SellerNavbar />

        {/* Main content */}
        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Seller
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Store Performance Overview</h1>
                  <p className="text-sm text-gray-500">
                    Monitor orders, earnings, and product performance for your Local Hunt shop.
                  </p>
                </div>
              </div>

            </div>
          </header>

          {/* Stats */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map(card => (
              <article key={card.label} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{card.change}</p>
                  </div>
                  <div className={`${card.color} rounded-xl p-3 text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Products & Orders */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                  <p className="text-sm text-gray-500">Your best-performing items over the last 30 days.</p>
                </div>
                <button 
                  onClick={() => navigate('/sellerproduct')}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Manage products
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 text-sm">No product sales data available</p>
                ) : (
                  topProducts.map(product => (
                    <div key={product.sku} className="rounded-xl border border-gray-100 px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                          {product.trend}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{product.sold} units sold</span>
                        <span>{product.stock} in stock</span>
                        <span className="font-semibold text-gray-900">{product.price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Newest orders from your Local Hunt store.</p>

              <ul className="mt-4 space-y-3 text-sm">
                {recentOrders.length === 0 ? (
                  <li className="text-center py-8 text-gray-500 text-sm">No recent orders</li>
                ) : (
                  recentOrders.map(order => (
                    <li key={order.id} className="rounded-xl border border-gray-100 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{order.productName}</span>
                        <span className="text-xs text-gray-400">{order.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{order.customer}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {order.items} item{order.items > 1 ? 's' : ''} • {order.total}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 font-medium ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'Ready to ship'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <button 
                onClick={() => navigate('/sellerorder')}
                className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                View all orders
              </button>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerDashboard