import { useState, useEffect } from 'react'
import {
  FaSearch,
  FaStar,
  FaTrash,
  FaUser,
  FaHeart,
} from 'react-icons/fa'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface Review {
  id: number
  userId: number
  userName: string
  userProfilePicture: string | null
  productId: number
  productName: string
  productImageUrl: string | null
  rating: number
  reviewText: string
  createdAt: string
  updatedAt: string
  likeCount?: number
  userLiked?: boolean
}

const AdminReviews = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRating, setSelectedRating] = useState<string>('All ratings')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/reviews/all')
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      } else {
        toast.error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('An error occurred while fetching reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this review?')
    if (!shouldDelete) return

    try {
      const response = await fetch(`http://localhost:8080/api/reviews/admin/${reviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReviews(prev => prev.filter(review => review.id !== reviewId))
          toast.success('Review deleted successfully')
        } else {
          toast.error(data.message || 'Failed to delete review')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete review' }))
        toast.error(errorData.message || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('An error occurred while deleting the review')
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

  const filteredReviews = reviews.filter(review => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = 
      review.productName.toLowerCase().includes(search) ||
      review.userName.toLowerCase().includes(search) ||
      review.reviewText.toLowerCase().includes(search)
    
    const matchesRating = 
      selectedRating === 'All ratings' || 
      review.rating.toString() === selectedRating

    return matchesSearch && matchesRating
  })

  const stats = {
    total: reviews.length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    fiveStar: reviews.filter(r => r.rating === 5).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
                <p className="text-sm text-gray-500">
                  Monitor and manage customer reviews across all marketplace products.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search product, user, or review..."
                    className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 sm:w-40"
                >
                  <option value="All ratings">All ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="rounded-xl bg-blue-500 p-3 text-white">
                    <FaStar className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.averageRating}</p>
                  </div>
                  <div className="rounded-xl bg-green-500 p-3 text-white">
                    <FaStar className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">5 Star Reviews</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.fiveStar}</p>
                  </div>
                  <div className="rounded-xl bg-yellow-500 p-3 text-white">
                    <FaStar className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">1 Star Reviews</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.oneStar}</p>
                  </div>
                  <div className="rounded-xl bg-red-500 p-3 text-white">
                    <FaStar className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All Reviews</h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
                  {reviews.length === 0
                    ? 'No reviews found. Reviews will appear here once customers submit them.'
                    : 'No reviews match the selected filters.'}
                </div>
              ) : (
                filteredReviews.map(review => {
                  const productImageUrl = review.productImageUrl
                    ? (review.productImageUrl.startsWith('http') 
                        ? review.productImageUrl 
                        : `http://localhost:8080${review.productImageUrl.startsWith('/') ? review.productImageUrl : '/' + review.productImageUrl}`)
                    : null

                  return (
                    <div key={review.id} className="rounded-xl border border-gray-100 p-6 hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {productImageUrl && (
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                              src={productImageUrl}
                              alt={review.productName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {review.userProfilePicture ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                <img
                                  src={review.userProfilePicture.startsWith('http') 
                                    ? review.userProfilePicture 
                                    : `http://localhost:8080${review.userProfilePicture}`}
                                  alt={review.userName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      const placeholder = document.createElement('div')
                                      placeholder.className = 'h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-semibold'
                                      placeholder.textContent = review.userName.charAt(0).toUpperCase()
                                      parent.insertBefore(placeholder, target)
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{review.userName}</p>
                              <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="mb-3">
                            <button
                              onClick={() => navigate(`/productdetail/${review.productId}`)}
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              {review.productName}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <FaStar
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">{review.rating}/5</span>
                          </div>
                          <p className="text-sm text-gray-700">{review.reviewText}</p>
                          {review.likeCount !== undefined && review.likeCount > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                              <FaHeart className="w-3.5 h-3.5 text-red-500 fill-current" />
                              <span>{review.likeCount} {review.likeCount === 1 ? 'like' : 'likes'}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="ml-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 shrink-0"
                        >
                          <FaTrash className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AdminReviews
