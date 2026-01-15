import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Footer from '../Components/Footer'
import Header from '../Components/Header'
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa'
import { sessionUtils } from '../utils/sessionUtils'

interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  productImageUrl: string
  quantity: number
  subtotal: number
}

const cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const userId = user.userId

      const response = await fetch(`http://localhost:8080/api/cart/${userId}`)
      if (response.ok) {
        const data = await response.json()
        const formattedItems: CartItem[] = data.map((item: any) => {
          // Convert imageUrl path to full URL
          let imageUrl = item.productImageUrl || ''
          if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = `http://localhost:8080${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
          }
          
          return {
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            productImageUrl: imageUrl,
            quantity: item.quantity,
            subtotal: item.subtotal,
          }
        })
        setCartItems(formattedItems)
      } else {
        console.error('Failed to fetch cart items')
      }
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartId: number, change: number) => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to update cart')
        navigate('/login')
        return
      }

      const userId = user.userId

      const item = cartItems.find(item => item.id === cartId)
      if (!item) return

      const newQuantity = item.quantity + change
      if (newQuantity < 1) return

      const response = await fetch(`http://localhost:8080/api/cart/${userId}/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        const data = await response.json()
        const updatedItem = data.cartItem
        let imageUrl = updatedItem.productImageUrl || ''
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          imageUrl = `http://localhost:8080${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
        }
        
        setCartItems(cartItems.map(item => 
          item.id === cartId 
            ? { ...item, quantity: updatedItem.quantity, subtotal: updatedItem.subtotal, productImageUrl: imageUrl }
            : item
        ))
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('An error occurred while updating quantity')
    }
  }

  const removeFromCart = async (cartId: number) => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to remove items from cart')
        navigate('/login')
        return
      }

      const userId = user.userId

      const response = await fetch(`http://localhost:8080/api/cart/${userId}/${cartId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCartItems(cartItems.filter(item => item.id !== cartId))
        toast.success('Item removed from cart')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('An error occurred while removing item')
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar/>
      <Header/>
      
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
                className="inline-block bg-red-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors"
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
                        src={item.productImageUrl || '/placeholder.png'}
                        alt={item.productName}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png'
                        }}
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.productName}</h3>
                        <p className="text-red-600 font-bold text-lg">NRP {item.productPrice.toFixed(2)}</p>

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
                      <span className="text-xl font-bold text-red-600">
                        NRP {(item.productPrice * item.quantity).toFixed(2)}
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
                      <span className="text-red-600">
                        NRP {(getTotalPrice() * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button className="w-full bg-red-400 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-500 transition-colors mb-4">
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
