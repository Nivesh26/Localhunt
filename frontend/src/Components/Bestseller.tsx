import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  imageUrl?: string
}

const BestSellers = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Update displayed products (first 4 from shuffled array)
  const updateDisplayedProducts = (productList: Product[]) => {
    const shuffled = shuffleArray(productList)
    setProducts(shuffled.slice(0, 4))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Shuffle products every 5 minutes
  useEffect(() => {
    if (allProducts.length > 0) {
      // Initial shuffle
      updateDisplayedProducts(allProducts)

      // Set up interval to shuffle every 5 minutes (300000 ms)
      const interval = setInterval(() => {
        updateDisplayedProducts(allProducts)
      }, 300000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [allProducts])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/products/live')
      if (response.ok) {
        const data = await response.json()
        // Map all products
        const formattedProducts: Product[] = data.map((p: any) => {
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
        setAllProducts(formattedProducts)
        // Initial shuffle will be handled by the useEffect
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className=" py-12 px-[40px] md:px-[80px]">
      <h2 className="text-2xl font-semibold mb-8">Best Sellers</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 place-items-center">
          {products.map((item) => (
            <Link
              key={item.id}
              to={`/productdetail/${item.id}`}
              className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 aspect-square w-[150px] sm:w-[190px] md:w-[210px] lg:w-[220px] bg-white flex items-center justify-center"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-400 text-xs">No Image</p>
                </div>
              )}

              {/* Overlay details */}
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-60 transition-all duration-300 flex flex-col justify-center items-center text-center text-white p-3">
                <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                <p className="text-sm font-semibold mb-1">NRP {item.price}</p>
                <span className="text-red-400 hover:text-red-600 underline text-xs">
                  View Product
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default BestSellers
