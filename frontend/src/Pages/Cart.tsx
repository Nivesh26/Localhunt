import { useState } from 'react'
import Topbar from '../Components/Topbar'
import Footer from '../Components/Footer'
import Header from '../Components/Header'
import bowl from '../assets/Bowl.png'
import cranes from '../assets/Swan.png'
import incense from '../assets/p3.png'
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa'

// Sample cart data - in a real app, this would come from context or localStorage
const sampleCartItems = [
  { id: 1, name: 'Handmade Pottery', category: 'Crafts', price: 40, image: cranes, quantity: 2 },
  { id: 2, name: 'Organic Honey', category: 'Food', price: 15, image: bowl, quantity: 1 },
  { id: 3, name: 'Wooden Sculpture', category: 'Crafts', price: 120, image: incense, quantity: 1 },
]

const cart = () => {
  const [cartItems, setCartItems] = useState(sampleCartItems)

  const updateQuantity = (id: number, change: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }
      }
      return item
    }))
  }

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar/>
      <Header/>
      
      {/* Cart Header */}
      {/* <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shopping Cart
          </h1>
          <p className="text-xl text-gray-700">
            Review your items and proceed to checkout
          </p>
        </div>
      </section> */}

      {/* Cart Content */}
      <section className="py-12 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          {cartItems.length === 0 ? (
            // Empty Cart
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
              <a
                href="/shop"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="md:col-span-2 space-y-4">
                {/* Cart Header Actions */}
                <div className="flex justify-between items-center bg-white rounded-xl shadow-md p-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({getTotalItems()})
                  </h2>
                </div>

                {/* Cart Item List */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                        <p className="text-blue-600 font-bold text-lg">NRP {item.price.toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-gray-700 font-medium">Quantity:</span>
                          <div className="flex items-center gap-2 border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 font-semibold text-gray-900 min-w-12 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <FaPlus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                        aria-label="Remove from cart"
                      >
                        <FaTrash className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Item Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        NRP {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="font-semibold">NRP {getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span className="font-semibold">NRP {(getTotalPrice() * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-blue-600">
                        NRP {(getTotalPrice() * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors mb-4">
                    Proceed to Checkout
                  </button>
                  
                  <a
                    href="/shop"
                    className="block w-full bg-gray-100 text-gray-900 py-4 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                  >
                    Continue Shopping
                  </a>

                  <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Free shipping on orders over NRP 50</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>30-day return policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer/>
    </div>
  )
}

export default cart 