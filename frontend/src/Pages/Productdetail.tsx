import { useState } from 'react'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import swan from '../assets/Swan.png'
import bowl from '../assets/Bowl.png'
import buddha from '../assets/P1.png'
import incense from '../assets/p3.png'

const Productdetail = () => {
  const [selectedSize, setSelectedSize] = useState('38')
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(swan)

  const sizes = ['38', '43', '45', '46']
  const thumbnails = [swan, bowl, buddha, incense]

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleImageClick = (image: string) => {
    setMainImage(image)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar/>
      <Header/>
      
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span className="hover:text-blue-600 cursor-pointer">Home</span>
          <span>/</span>
          <span className="hover:text-blue-600 cursor-pointer">Shop</span>
          <span>/</span>
          <span className="text-gray-900">Handmade Pottery</span>
        </div>

        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="mb-4 bg-white rounded-xl overflow-hidden shadow-md">
              <img src={mainImage} alt="Handmade Pottery" className="w-full h-96 object-cover" />
            </div>
            <div className="flex gap-2">
              {thumbnails.map((thumb, index) => (
                <img
                  key={index}
                  src={thumb}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleImageClick(thumb)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    mainImage === thumb ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Handmade Pottery</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex text-yellow-500">
                ★★★★★
              </div>
              <span className="text-gray-600">4.5 (99 sold)</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-blue-600">NRP 40.00</span>
              <span className="text-xl text-gray-400 line-through">NRP 60.00</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                Made-up of natural and organic materials, this pottery is handcrafted 
                with rich quality and durability. Perfect for home decoration and 
                designed with vintage character that develops with time.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-3">Size EU</label>
              <div className="flex gap-3">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`w-16 h-12 border-2 rounded-lg font-semibold transition-all ${
                      selectedSize === size
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-900 font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-16 text-center border-0 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                ADD TO CART
              </button>
              <button className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                BUY NOW
              </button>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Premium material that gains vintage character with use.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Originally designed for traditional craftsmanship.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Perfect for Home Decoration.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Made in Nepal.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              100% Handcrafted.
            </li>
          </ul>
        </div>

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
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Organic Honey', image: bowl, price: 15 },
              { name: 'Wooden Sculpture', image: incense, price: 120 },
              { name: 'Buddha Statue', image: buddha, price: 85 },
              { name: 'Traditional Shawl', image: swan, price: 55 },
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-blue-600 font-bold">NRP {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  )
}

export default Productdetail