import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'

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
}

interface RelatedProduct {
  id: number
  name: string
  price: number
  imageUrl?: string
}

const Productdetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState<string>('')

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchRelatedProducts()
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
        setProduct(data)
        setMainImage(data.imageUrl || '')
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
        const selected = shuffled.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
        }))
        setRelatedProducts(selected)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
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
  const thumbnails = product.imageUrl ? [product.imageUrl] : []

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
                <img src={mainImage} alt={product.name} className="w-full h-96 object-cover" />
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
                ★★★★★
              </div>
              <span className="text-gray-600">4.5 ({product.stock} in stock)</span>
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
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                className="flex-1 bg-red-400 text-white py-4 rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button 
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
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Rating</h3>
          <div className="flex items-center gap-4 mb-8">
            <div className="text-5xl font-bold text-gray-900">4.5</div>
            <div className="text-4xl text-yellow-500">★</div>
            <div className="text-gray-600">(99 reviews)</div>
          </div>

          <div className="space-y-2">
            {[
              { stars: 5, percent: 70 },
              { stars: 4, percent: 20 },
              { stars: 3, percent: 5 },
              { stars: 2, percent: 2 },
              { stars: 1, percent: 2 },
            ].map(({ stars, percent }) => (
              <div key={stars} className="flex items-center gap-4">
                <span className="w-12">{stars} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${percent}%` }}></div>
                </div>
                <span className="w-12 text-right">{percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h3>
          <div className="text-center py-12 text-gray-600">
            <p>Customer reviews will be displayed here</p>
          </div>
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
                    <img
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover"
                    />
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