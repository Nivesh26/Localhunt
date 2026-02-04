import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Footer from '../Components/Footer'
import Header from '../Components/Header'
import { FaTrash, FaPlus, FaMinus, FaBox } from 'react-icons/fa'
import { sessionUtils } from '../utils/sessionUtils'

interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  productImageUrl: string
  quantity: number
  subtotal: number
  sellerName?: string
  isStoreActive?: boolean
}

const cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

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
            sellerName: item.sellerName,
            isStoreActive: item.isStoreActive !== false, // Default to true if not provided
          }
        })
        setCartItems(formattedItems)
      } else if (response.status === 404) {
        // User was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
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
        // Dispatch event to update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else if (response.status === 404) {
        // User was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
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
        // Dispatch event to update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else if (response.status === 404) {
        // User was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('An error occurred while removing item')
    }
  }

  const handleSelectItem = (itemId: number) => {
    const item = cartItems.find(i => i.id === itemId)
    // Don't allow selection of items from paused stores
    if (item && item.isStoreActive === false) {
      return
    }
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      // Deselect all
      setSelectedItems(new Set())
    } else {
      // Select only items from active stores
      setSelectedItems(new Set(cartItems.filter(item => item.isStoreActive !== false).map(item => item.id)))
    }
  }

  const getSelectedItems = () => {
    // Only return selected items that are from active stores
    return cartItems.filter(item => selectedItems.has(item.id) && item.isStoreActive !== false)
  }

  const getTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => total + item.productPrice * item.quantity, 0)
  }

  const getTotalItems = () => {
    return getSelectedItems().reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = () => {
    const selected = getSelectedItems()
    if (selected.length === 0) {
      toast.error('Please select at least one item to checkout')
      return
    }
    // Pass selected items to checkout page
    navigate('/checkout', { state: { selectedItems: selected } })
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
      <section className="py-8 md:py-12 px-4 sm:px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Track Your Purchase Button - Always Visible */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate('/ordertracking')}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              title="Track Your Purchase"
            >
              <FaBox className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Track Order</span>
            </button>
          </div>

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
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cartItems.length > 0 && selectedItems.size === cartItems.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cart Items ({cartItems.length})
                      {selectedItems.size > 0 && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          ({selectedItems.size} selected)
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Cart Item List */}
                {cartItems.map((item) => {
                  const isOutOfStock = item.isStoreActive === false
                  return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
                      !selectedItems.has(item.id) || isOutOfStock ? 'opacity-60' : ''
                    } ${isOutOfStock ? 'border-2 border-red-200' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex gap-4 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id) && !isOutOfStock}
                        onChange={() => handleSelectItem(item.id)}
                        disabled={isOutOfStock}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer mt-1 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      
                      {/* Product Image */}
                      <img
                        src={item.productImageUrl || '/placeholder.png'}
                        alt={item.productName}
                        className="w-20 h-20 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png'
                        }}
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{item.productName}</h3>
                          {isOutOfStock && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        {item.sellerName && (
                          <p className="text-sm text-gray-500 mb-1">
                            Sold by: <span className="font-medium">{item.sellerName}</span>
                          </p>
                        )}
                        {isOutOfStock && (
                          <p className="text-sm text-red-600 mb-2 font-medium">
                            This item is currently unavailable. The seller has paused their store.
                          </p>
                        )}
                        <p className="text-red-600 font-bold text-lg">NRP {item.productPrice.toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-gray-700 font-medium">Quantity:</span>
                          <div className="flex items-center gap-2 border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={isOutOfStock}
                              className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus className="w-5 h-5" />
                            </button>
                            <span className={`px-4 py-2 font-semibold min-w-12 text-center ${
                              isOutOfStock ? 'text-gray-400' : 'text-gray-900'
                            }`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={isOutOfStock}
                              className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <FaPlus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Remove Button - row on mobile */}
                      <div className="flex justify-end sm:block sm:self-start">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                        aria-label="Remove from cart"
                      >
                        <FaTrash className="w-6 h-6" />
                      </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className={`mt-4 pt-4 border-t flex justify-between items-center ${
                      isOutOfStock ? 'opacity-50' : ''
                    }`}>
                      <span className="text-gray-700 font-medium">Item Total:</span>
                      <span className="text-xl font-bold text-red-600">
                        NRP {(item.productPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 md:top-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({getTotalItems()} selected item{getTotalItems() !== 1 ? 's' : ''})</span>
                      <span className="font-semibold">NRP {getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (13%)</span>
                      <span className="font-semibold">NRP {(getTotalPrice() * 0.13).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-red-600">
                        NRP {(getTotalPrice() * 1.13).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors mb-4 ${
                      selectedItems.size === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-400 text-white hover:bg-red-500'
                    }`}
                  >
                    Proceed to Checkout ({selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''})
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
