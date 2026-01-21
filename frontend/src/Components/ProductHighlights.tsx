import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  imageUrl?: string
}

const ProductHighlights = () => {
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
    <div className="bg-white py-10 px-[40px] md:px-[80px]">
      <h2 className="text-xl font-semibold mb-8">Product Highlights</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">No products available</p>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-6 md:gap-10">
          {products.map((item) => (
            <Link
              key={item.id}
              to={`/productdetail/${item.id}`}
              className="group relative w-[220px] md:w-[260px] bg-white shadow-sm hover:shadow-md rounded-md overflow-hidden transition-all duration-300"
            >
              <div className="overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <div className="w-full h-[250px] flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[250px] bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">No Image</p>
                  </div>
                )}
              </div>

              <div className="p-4 text-center">
                <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                <p className="text-sm font-semibold text-gray-800">NRP {item.price}</p>
              </div>

              {/* Black line on hover */}
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductHighlights
