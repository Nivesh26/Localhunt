import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaPaperPlane, FaStar, FaTrash, FaHeart } from 'react-icons/fa'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { sessionUtils } from '../utils/sessionUtils'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  category: string
  description: string
  imageUrl?: string
  specs?: string
  sizeEu?: string
  sizeClothing?: string
  sellerName?: string
  sellerId?: number
}

interface RelatedProduct {
  id: number
  name: string
  price: number
  imageUrl?: string
}

interface Review {
  id: number
  userId: number
  userName: string
  userProfilePicture?: string | null
  productId: number
  productName: string
  rating: number
  reviewText: string
  createdAt: string
  updatedAt: string
  likeCount?: number
  userLiked?: boolean
}

const Productdetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState<string>('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchRelatedProducts()
      fetchReviews()
      fetchAverageRating()
    }
    // Check if review=true query parameter exists
    if (searchParams.get('review') === 'true') {
      setShowReviewForm(true)
      // Remove query parameter from URL
      navigate(`/productdetail/${id}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchProduct = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        // Convert comma-separated imageUrl paths to full URLs
        let imageUrl = data.imageUrl || ''
        if (imageUrl) {
          // Parse comma-separated URLs and convert each to full URL
          const urls = imageUrl.split(',').map((url: string) => {
            const trimmed = url.trim()
            if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
              return `http://localhost:8080${trimmed.startsWith('/') ? trimmed : '/' + trimmed}`
            }
            return trimmed
          }).filter(Boolean)
          imageUrl = urls.join(',')
        }
        
        setProduct({
          ...data,
          imageUrl: imageUrl,
        })
        // Set first image as main image
        const firstImage = imageUrl ? imageUrl.split(',')[0].trim() : ''
        setMainImage(firstImage)
        // Set default size if available
        if (data.sizeEu) {
          const sizes = data.sizeEu.split(',').map((s: string) => s.trim())
          if (sizes.length > 0) {
            setSelectedSize(sizes[0])
          }
        } else if (data.sizeClothing) {
          const sizes = data.sizeClothing.split(',').map((s: string) => s.trim())
          if (sizes.length > 0) {
            setSelectedSize(sizes[0])
          }
        }
      } else {
        console.error('Failed to fetch product')
        navigate('/shop')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products/live')
      if (response.ok) {
        const data = await response.json()
        // Get 4 random products excluding current product
        const filtered = data.filter((p: any) => p.id !== Number(id))
        const shuffled = filtered.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, 4).map((p: any) => {
          // Parse comma-separated image URLs and convert first one to full URL
          let imageUrl = p.imageUrl || ''
          if (imageUrl) {
            // Get first image from comma-separated string
            const firstImage = imageUrl.split(',')[0].trim()
            if (firstImage && !firstImage.startsWith('http://') && !firstImage.startsWith('https://')) {
              imageUrl = `http://localhost:8080${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`
            } else {
              imageUrl = firstImage
            }
          }
          
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            imageUrl: imageUrl,
          }
        })
        setRelatedProducts(selected)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const fetchReviews = async () => {
    if (!id) return
    try {
      const user = sessionUtils.getUser()
      const userId = user?.userId || null
      const url = userId 
        ? `http://localhost:8080/api/reviews/product/${id}?userId=${userId}`
        : `http://localhost:8080/api/reviews/product/${id}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleToggleLike = async (reviewId: number) => {
    const user = sessionUtils.getUser()
    if (!user) {
      toast.error('Please login to like reviews')
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}/like/${user.userId}`, {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh reviews to get updated like count
        fetchReviews()
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to toggle like' }))
        toast.error(errorData.message || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('An error occurred while toggling like')
    }
  }

  const fetchAverageRating = async () => {
    if (!id) return
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/product/${id}/average-rating`)
      if (response.ok) {
        const data = await response.json()
        if (data.averageRating !== null) {
          setAverageRating(data.averageRating)
        }
      }
    } catch (error) {
      console.error('Error fetching average rating:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Please write a review')
      return
    }

    const user = sessionUtils.getUser()
    if (!user) {
      toast.error('Please login to write a review')
      navigate('/login')
      return
    }

    setSubmittingReview(true)
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/user/${user.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: Number(id),
          rating: reviewRating,
          reviewText: reviewText.trim(),
        }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to submit review'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          if (response.status === 403) {
            errorMessage = 'Access denied. Please check if the backend server has been restarted.'
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        }
        toast.error(errorMessage)
        return
      }

      const data = await response.json()

      if (data.success) {
        toast.success('Review submitted successfully!')
        setReviewText('')
        setReviewRating(5)
        setShowReviewForm(false)
        // Refresh reviews and average rating
        fetchReviews()
        fetchAverageRating()
      } else {
        toast.error(data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('An error occurred while submitting review. Please check if the backend server is running.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return
    }

    const user = sessionUtils.getUser()
    if (!user) {
      toast.error('Please login to delete reviews')
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}/user/${user.userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Review deleted successfully!')
        // Remove review from local state
        setReviews(reviews.filter(review => review.id !== reviewId))
        // Refresh average rating
        fetchAverageRating()
      } else {
        toast.error(data.message || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('An error occurred while deleting review')
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && product && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleImageClick = (image: string) => {
    setMainImage(image)
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to add items to cart')
        navigate('/login?returnUrl=/product/' + id)
        return
      }

      const userId = user.userId

      const response = await fetch(`http://localhost:8080/api/cart/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Product added to cart successfully!')
        // Dispatch event to update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        toast.error(data.message || 'Failed to add product to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('An error occurred while adding to cart')
    }
  }

  const handleBuyNow = () => {
    if (!product) return

    const user = sessionUtils.getUser()
    if (!user) {
      toast.error('Please login to proceed with checkout')
      navigate('/login?returnUrl=/productdetail/' + id)
      return
    }

    // Get first image from comma-separated imageUrl
    const firstImage = product.imageUrl ? product.imageUrl.split(',')[0].trim() : ''
    const productImageUrl = firstImage && !firstImage.startsWith('http://') && !firstImage.startsWith('https://')
      ? `http://localhost:8080${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`
      : firstImage

    // Format product as CartItem for checkout
    const cartItem = {
      id: product.id, // Using product id as temporary cart item id
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImageUrl: productImageUrl || '/placeholder.png',
      quantity: quantity,
      subtotal: product.price * quantity,
      sellerName: product.sellerName
    }

    // Navigate to checkout with the selected item
    navigate('/checkout', {
      state: {
        selectedItems: [cartItem]
      }
    })
  }

  const getSizes = () => {
    if (!product) return []
    if (product.sizeEu) {
      return product.sizeEu.split(',').map(s => s.trim())
    }
    if (product.sizeClothing) {
      return product.sizeClothing.split(',').map(s => s.trim())
    }
    return []
  }

  const getSpecs = () => {
    if (!product || !product.specs) return []
    return product.specs.split('\n').filter(s => s.trim())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar/>
        <Header/>
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar/>
        <Header/>
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Product not found</p>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }

  const sizes = getSizes()
  const specs = getSpecs()
  // Parse comma-separated image URLs to array
  const thumbnails = product.imageUrl ? product.imageUrl.split(',').map(url => url.trim()).filter(Boolean) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar/>
      <Header/>
      
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-red-600 cursor-pointer">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-red-600 cursor-pointer">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="mb-4 bg-white rounded-xl overflow-hidden shadow-md">
              {mainImage ? (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-400">No Image</p>
                </div>
              )}
            </div>
            {thumbnails.length > 1 && (
              <div className="flex gap-2">
                {thumbnails.map((thumb, index) => (
                  <img
                    key={index}
                    src={thumb}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => handleImageClick(thumb)}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                      mainImage === thumb ? 'border-red-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {product.sellerName && (
              <div className="mb-4">
                <span className="text-gray-600">Sold by: <span className="font-semibold">{product.sellerName}</span></span>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex text-yellow-500">
                {averageRating !== null ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < Math.round(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-2 text-gray-700 font-semibold">{averageRating.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    <FaStar className="text-gray-300" />
                    <FaStar className="text-gray-300" />
                    <FaStar className="text-gray-300" />
                    <FaStar className="text-gray-300" />
                    <FaStar className="text-gray-300" />
                    <span className="ml-2 text-gray-500">No ratings yet</span>
                  </>
                )}
              </div>
              <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}, {product.stock} in stock)</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-red-600">NRP {product.price}</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-900 font-medium mb-3">
                  {product.sizeEu ? 'Size EU' : 'Size'}
                </label>
                <div className="flex gap-3 flex-wrap">
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={`w-16 h-12 border-2 rounded-lg font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-red-400 bg-red-400 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-red-300'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-gray-900 font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1))
                      setQuantity(val)
                    }}
                    min="1"
                    max={product.stock}
                    className="w-16 text-center border-0 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">({product.stock} available)</span>
                {product.sellerId && sessionUtils.isLoggedIn() && (() => {
                  const user = sessionUtils.getUser()
                  // Only show for logged-in users with role USER
                  if (user && user.role === 'USER') {
                    return (
                      <button
                        onClick={() => {
                          // Trigger GlobalChatWidget to open and select this vendor
                          console.log('Message Vendor button clicked:', {
                            sellerId: product.sellerId,
                            sellerName: product.sellerName,
                            productId: product.id,
                            productName: product.name
                          }) // Debug log
                          const event = new CustomEvent('openChatWidget', {
                            detail: { 
                              sellerId: product.sellerId,
                              sellerName: product.sellerName || 'Vendor',
                              productId: product.id,
                              productName: product.name,
                              productDescription: product.description,
                              productImage: mainImage || (product.imageUrl ? product.imageUrl.split(',')[0].trim() : '')
                            }
                          })
                          window.dispatchEvent(event)
                          console.log('openChatWidget event dispatched') // Debug log
                        }}
                        className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        <FaPaperPlane />
                        Message Vendor
                      </button>
                    )
                  }
                  return null
                })()}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-red-400 text-white py-4 rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock === 0}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {specs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h3>
            <ul className="space-y-3 text-gray-700">
              {specs.map((spec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating Breakdown */}
        {averageRating !== null && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Rating</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div className="text-4xl text-yellow-500">
                <FaStar className="fill-current" />
              </div>
              <div className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</div>
            </div>

            {/* Calculate rating distribution */}
            {(() => {
              const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
              reviews.forEach(review => {
                distribution[review.rating as keyof typeof distribution]++
              })
              const maxCount = Math.max(...Object.values(distribution))
              
              return (
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = distribution[stars as keyof typeof distribution]
                    const percent = maxCount > 0 ? (count / maxCount) * 100 : 0
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={stars} className="flex items-center gap-4">
                        <span className="w-12">{stars} ★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-12 text-right text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* Review Form */}
        {sessionUtils.isLoggedIn() && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h3>
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-red-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors"
              >
                Write a Review
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-3xl transition-colors ${
                          star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        type="button"
                      >
                        <FaStar className={star <= reviewRating ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[120px]"
                    maxLength={1000}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {reviewText.length}/1000
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewText.trim()}
                    className="bg-red-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false)
                      setReviewText('')
                      setReviewRating(5)
                    }}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    {/* User Profile Picture */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-200 flex items-center justify-center">
                      {review.userProfilePicture ? (
                        <img
                          src={
                            review.userProfilePicture.startsWith('http')
                              ? review.userProfilePicture
                              : `http://localhost:8080${review.userProfilePicture}`
                          }
                          alt={review.userName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-red-500 flex items-center justify-center text-white font-semibold text-lg">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={
                                    i < review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }
                                  style={{ width: '14px', height: '14px' }}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        {(() => {
                          const user = sessionUtils.getUser()
                          if (user && user.userId === review.userId) {
                            return (
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete your review"
                                aria-label="Delete review"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            )
                          }
                          return null
                        })()}
                      </div>
                      <p className="text-gray-700 leading-relaxed mt-2">{review.reviewText}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => handleToggleLike(review.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                            review.userLiked
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={review.userLiked ? 'Unlike this review' : 'Like this review'}
                        >
                          <FaHeart className={`w-4 h-4 ${review.userLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">
                            {review.likeCount || 0}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/productdetail/${relatedProduct.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {relatedProduct.imageUrl ? (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={relatedProduct.imageUrl}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-400">No Image</p>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{relatedProduct.name}</h4>
                    <p className="text-red-600 font-bold">NRP {relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer/>
    </div>
  )
}

export default Productdetail