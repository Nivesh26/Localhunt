import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  imageUrl?: string
}

const Shopnow = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/products/live')
      if (response.ok) {
        const data = await response.json()
        // Get first 4 products
        const limitedProducts = data.slice(0, 4).map((p: any) => {
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
        setProducts(limitedProducts)
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
      <h2 className="text-xl font-semibold mb-8">Shop Now</h2>

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

export default Shopnow
