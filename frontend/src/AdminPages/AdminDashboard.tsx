import {
  FaCube,
  FaDollarSign,
  FaShieldAlt,
  FaStore,
  FaBell,
  FaTimes,
  FaStar,
} from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponents/AdminNavbar'

interface DashboardStats {
  totalVendors: number
  activeProducts: number
  gmv30d: number
  pendingVerifications: number
  totalCommission: number
}

interface TopVendor {
  sellerId: number
  businessName: string
  businessCategory: string
  productCount: number
  growth: number
  rating: number
}

interface OnboardingRequest {
  id: number
  businessName: string
  ownerName: string
  submittedAt: string
  documents: string
  status: string
}

interface NewReview {
  id: number
  productId: number
  productName: string
  userName: string
  rating: number
  reviewText: string
  createdAt: string
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topVendors, setTopVendors] = useState<TopVendor[]>([])
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([])
  const [newReviews, setNewReviews] = useState<NewReview[]>([])
  const [viewedVendorRequests, setViewedVendorRequests] = useState<Set<number>>(new Set())
  const [viewedReviews, setViewedReviews] = useState<Set<number>>(new Set())
  const [showAlerts, setShowAlerts] = useState(false)
  const [alertTab, setAlertTab] = useState<'vendors' | 'reviews'>('vendors')
  const alertsRef = useRef<HTMLDivElement>(null)
  const previousVendorRequestIds = useRef<Set<number>>(new Set())
  const previousReviewIds = useRef<Set<number>>(new Set())

  // Load viewed state from localStorage on mount
  useEffect(() => {
    const savedViewedVendors = localStorage.getItem('viewedVendorRequests')
    const savedViewedReviews = localStorage.getItem('viewedReviews')
    
    if (savedViewedVendors) {
      try {
        const ids = JSON.parse(savedViewedVendors)
        setViewedVendorRequests(new Set(ids))
      } catch (e) {
        console.error('Error loading viewed vendor requests:', e)
      }
    }
    
    if (savedViewedReviews) {
      try {
        const ids = JSON.parse(savedViewedReviews)
        setViewedReviews(new Set(ids))
      } catch (e) {
        console.error('Error loading viewed reviews:', e)
      }
    }
  }, [])

  // Save viewed state to localStorage whenever it changes
  useEffect(() => {
    if (viewedVendorRequests.size > 0) {
      localStorage.setItem('viewedVendorRequests', JSON.stringify(Array.from(viewedVendorRequests)))
    }
  }, [viewedVendorRequests])

  useEffect(() => {
    if (viewedReviews.size > 0) {
      localStorage.setItem('viewedReviews', JSON.stringify(Array.from(viewedReviews)))
    }
  }, [viewedReviews])

  useEffect(() => {
    fetchDashboardData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mark alerts as viewed when dropdown is opened
  useEffect(() => {
    if (showAlerts) {
      // Mark all current vendor requests as viewed
      const vendorRequestIds = new Set(onboardingRequests.map(r => r.id))
      setViewedVendorRequests(prev => new Set([...prev, ...vendorRequestIds]))
      
      // Mark all current reviews as viewed
      const reviewIds = new Set(newReviews.map(r => r.id))
      setViewedReviews(prev => new Set([...prev, ...reviewIds]))
    }
  }, [showAlerts, onboardingRequests, newReviews])

  // Close alerts dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlerts(false)
      }
    }

    if (showAlerts) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAlerts])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all dashboard data in parallel
      const [statsResponse, vendorsResponse, requestsResponse, reviewsResponse] = await Promise.all([
        fetch('http://localhost:8080/api/admin/dashboard/stats'),
        fetch('http://localhost:8080/api/admin/dashboard/top-vendors'),
        fetch('http://localhost:8080/api/admin/dashboard/onboarding-requests'),
        fetch('http://localhost:8080/api/reviews/all'),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json()
        setTopVendors(vendorsData)
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        const currentIds = new Set(requestsData.map((r: OnboardingRequest) => r.id))
        
        // Check if there are new vendor requests
        const hasNewRequests = Array.from(currentIds).some(id => !previousVendorRequestIds.current.has(id))
        
        // If new requests arrive, clear viewed state so all show again
        if (hasNewRequests && previousVendorRequestIds.current.size > 0) {
          setViewedVendorRequests(new Set())
          localStorage.removeItem('viewedVendorRequests')
        }
        
        previousVendorRequestIds.current = currentIds 
        setOnboardingRequests(requestsData)
      }

      if (reviewsResponse.ok) {
        const allReviews = await reviewsResponse.json()
        // Filter reviews from last 24 hours
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
        
        const recentReviews = allReviews
          .filter((review: any) => {
            const reviewDate = new Date(review.createdAt)
            return reviewDate >= twentyFourHoursAgo
          })
          .slice(0, 5) // Show latest 5 new reviews
          .map((review: any) => ({
            id: review.id,
            productId: review.productId,
            productName: review.productName,
            userName: review.userName,
            rating: review.rating,
            reviewText: review.reviewText,
            createdAt: review.createdAt,
          }))
        
        const currentReviewIds = new Set(recentReviews.map((r: NewReview) => r.id))
        
        // Check if there are new reviews
        const hasNewReviews = Array.from(currentReviewIds).some(id => !previousReviewIds.current.has(id))
        
        // If new reviews arrive, clear viewed state so all show again
        if (hasNewReviews && previousReviewIds.current.size > 0) {
          setViewedReviews(new Set())
          localStorage.removeItem('viewedReviews')
        }
        
        previousReviewIds.current = currentReviewIds
        setNewReviews(recentReviews)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 3600) {
        return 'Just now'
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} ${days === 1 ? 'day' : 'days'} ago`
      }
    } catch (error) {
      return 'Unknown'
    }
  }

  const statCards = stats ? [
    { label: 'Total Vendors', value: stats.totalVendors.toString(), icon: FaStore, color: 'bg-red-500' },
    { label: 'Active Products', value: stats.activeProducts.toString(), icon: FaCube, color: 'bg-blue-500' },
    { label: 'Admin Commission (20%)', value: `NRP ${(stats.totalCommission ?? 0).toFixed(2)}`, icon: FaDollarSign, color: 'bg-emerald-600' },
    { label: 'Pending Verifications', value: stats.pendingVerifications.toString(), icon: FaShieldAlt, color: 'bg-amber-500' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
        <AdminNavbar />

        {/* Main content */}
        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">Admin</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Marketplace Control Center</h1>
                  <p className="text-sm text-gray-500">Track vendor performance, approvals, payouts, and customer happiness.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative" ref={alertsRef}>
                  <button 
                    onClick={() => setShowAlerts(!showAlerts)}
                    className="relative flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <FaBell className="h-5 w-5" />
                    Alerts
                    {(() => {
                      const unviewedVendors = onboardingRequests.filter(r => !viewedVendorRequests.has(r.id)).length
                      const unviewedReviews = newReviews.filter(r => !viewedReviews.has(r.id)).length
                      const totalUnviewed = unviewedVendors + unviewedReviews
                      return totalUnviewed > 0 ? (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-red-600">
                          {totalUnviewed > 99 ? '99+' : totalUnviewed}
                        </span>
                      ) : null
                    })()}
                  </button>

                  {showAlerts && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">Alerts</h3>
                          <button
                            onClick={() => setShowAlerts(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setShowAlerts(false)
                            if (alertTab === 'vendors') {
                              navigate('/adminvendorsapprove')
                            } else {
                              navigate('/adminreviews')
                            }
                          }}
                          className="w-full rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                        >
                          {alertTab === 'vendors' ? 'View All Requests' : 'View All Reviews'}
                        </button>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex border-b border-gray-200">
                        <button
                          onClick={() => setAlertTab('vendors')}
                          className={`relative flex-1 px-4 py-2 text-xs font-semibold transition ${
                            alertTab === 'vendors'
                              ? 'text-red-600 border-b-2 border-red-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Vendor Requests
                          {(() => {
                            const unviewed = onboardingRequests.filter(r => !viewedVendorRequests.has(r.id)).length
                            return unviewed > 0 ? (
                              <span className="absolute -top-1 -right-1 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-semibold text-white">
                                {unviewed > 99 ? '99+' : unviewed}
                              </span>
                            ) : null
                          })()}
                        </button>
                        <button
                          onClick={() => setAlertTab('reviews')}
                          className={`relative flex-1 px-4 py-2 text-xs font-semibold transition ${
                            alertTab === 'reviews'
                              ? 'text-red-600 border-b-2 border-red-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          New Reviews
                          {(() => {
                            const unviewed = newReviews.filter(r => !viewedReviews.has(r.id)).length
                            return unviewed > 0 ? (
                              <span className="absolute -top-1 -right-1 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-semibold text-white">
                                {unviewed > 99 ? '99+' : unviewed}
                              </span>
                            ) : null
                          })()}
                        </button>
                      </div>

                      <div className="p-2">
                        {alertTab === 'vendors' ? (
                          onboardingRequests.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No pending vendor requests
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {onboardingRequests.map(request => (
                                <div
                                  key={request.id}
                                  onClick={() => {
                                    setShowAlerts(false)
                                    navigate('/adminvendorsapprove')
                                  }}
                                  className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-gray-900">{request.businessName}</p>
                                      <p className="text-xs text-gray-500 mt-1">Owner: {request.ownerName}</p>
                                      <p className="text-xs text-gray-400 mt-1">{request.submittedAt}</p>
                                    </div>
                                    <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                                      request.status === 'High Priority' ? 'bg-red-50 text-red-600' :
                                      request.status === 'Follow-up' ? 'bg-amber-50 text-amber-600' :
                                      request.status === 'Ready to Approve' ? 'bg-green-50 text-green-600' :
                                      'bg-gray-50 text-gray-600'
                                    }`}>
                                      {request.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          newReviews.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No new reviews in the last 24 hours
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {newReviews.map(review => (
                                <div
                                  key={review.id}
                                  className="p-3 rounded-lg border border-gray-100"
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <FaStar
                                            key={star}
                                            className={`h-3 w-3 ${
                                              star <= review.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <p className="text-sm font-semibold text-gray-900">{review.productName}</p>
                                      <p className="text-xs text-gray-500 mt-1">By: {review.userName}</p>
                                      <p className="text-xs text-gray-400 mt-1">{formatDate(review.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map(card => (
                  <article key={card.label} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
                      </div>
                      <div className={`${card.color} rounded-xl p-3 text-white`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}

          {!loading && (
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Performing Vendors</h2>
                  <p className="text-sm text-gray-500">Vendors with the most products listed</p>
                </div>

                <div className="mt-5 space-y-4">
                  {topVendors.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No vendor data available</p>
                  ) : (
                    topVendors.map(vendor => (
                      <div key={vendor.sellerId} className="rounded-xl border border-gray-100 px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{vendor.businessName}</p>
                            <p className="text-xs text-gray-500">{vendor.businessCategory}</p>
                          </div>
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                            +{vendor.growth.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>{vendor.productCount} products</span>
                          <span>Rating {vendor.rating.toFixed(1)}/5</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, (vendor.productCount / 10))}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Onboarding Queue</h2>
                <p className="text-sm text-gray-500">Vendors awaiting verification or review</p>
                <ul className="mt-4 space-y-4">
                  {onboardingRequests.length === 0 ? (
                    <li className="text-center py-8 text-gray-500 text-sm">No pending requests</li>
                  ) : (
                    onboardingRequests.map(request => (
                      <li key={request.id} className="rounded-xl border border-gray-100 p-4">
                        <p className="text-sm font-semibold text-gray-900">{request.businessName}</p>
                        <p className="text-xs text-gray-500">Owner: {request.ownerName}</p>
                        <p className="text-xs text-gray-500">Documents: {request.documents}</p>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-gray-400">{request.submittedAt}</span>
                          <span className={`rounded-full px-3 py-1 font-medium ${
                            request.status === 'High Priority' ? 'bg-red-50 text-red-600' :
                            request.status === 'Follow-up' ? 'bg-amber-50 text-amber-600' :
                            request.status === 'Ready to Approve' ? 'bg-green-50 text-green-600' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                <button 
                  onClick={() => navigate('/adminvendorsapprove')}
                  className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Open Vendor Requests
                </button>
              </article>
            </section>
          )}

          {/* <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
                  <p className="text-sm text-gray-500">Vendor requests requiring admin attention</p>
                </div>
                <TicketIcon className="h-6 w-6 text-red-500" />
              </div>
              <ul className="mt-4 space-y-3">
                {supportTickets.map(ticket => (
                  <li key={ticket.id} className="rounded-xl border border-gray-100 px-4 py-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                      <span>{ticket.id}</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{ticket.topic}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                      <span>{ticket.vendor}</span>
                      <span>{ticket.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            
          </section> */}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard