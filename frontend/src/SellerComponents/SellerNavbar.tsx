import {
  FaHome,
  FaCube,
  FaShoppingBag,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaHistory,
  FaCamera,
  FaStar,
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import logo from '../assets/Local Hunt Logo NoBG.png'
import { sessionUtils } from '../utils/sessionUtils'

const navLinks = [
  { label: 'Overview', icon: FaHome, to: '/sellerdashboard' },
  { label: 'Products', icon: FaCube, to: '/sellerproduct' },
  { label: 'Orders', icon: FaShoppingBag, to: '/sellerorder' },
  { label: 'History', icon: FaHistory, to: '/sellerhistory' },
  { label: 'Reviews', icon: FaStar, to: '/sellerreviews' },
  { label: 'Messages', icon: FaComments, to: '/sellermessage' },
  { label: 'Settings', icon: FaCog, to: '/sellersetting' },
]

const SellerNavbar = () => {
  const navigate = useNavigate()
  const [sellerName, setSellerName] = useState('Store owner')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [orderCount, setOrderCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    let isMounted = true

    const fetchSellerProfile = async () => {
      try {
        const user = sessionUtils.getUser()
        if (!user || user.role !== 'VENDOR') {
          if (isMounted) {
            setSellerName('Store owner')
            setProfilePicture(null)
          }
          return
        }

        const sellerId = user.userId
        const response = await fetch(`http://localhost:8080/api/seller/profile/${sellerId}`)
        
        if (response.ok && isMounted) {
          const data = await response.json()
          setSellerName(data.userName || 'Store owner')
          
          // Set profile picture URL if exists
          if (data.profilePicture) {
            const avatarUrl = data.profilePicture.startsWith('http')
              ? data.profilePicture
              : `http://localhost:8080${data.profilePicture}`
            setProfilePicture(avatarUrl)
          } else {
            setProfilePicture(null)
          }
        }
      } catch (error) {
        console.error('Error fetching seller profile:', error)
        if (isMounted) {
          setSellerName('Store owner')
          setProfilePicture(null)
        }
      }
    }

    fetchSellerProfile()

    // Listen for profile picture updates
    const handleProfilePictureUpdate = () => {
      if (isMounted) {
        fetchSellerProfile()
      }
    }

    window.addEventListener('sellerProfilePictureUpdated', handleProfilePictureUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('sellerProfilePictureUpdated', handleProfilePictureUpdate)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchCounts = async () => {
      try {
        const user = sessionUtils.getUser()
        if (!user || user.role !== 'VENDOR') {
          return
        }

        const sellerId = user.userId

        // Fetch orders count (pending/processing orders)
        const ordersResponse = await fetch(`http://localhost:8080/api/payment/seller-orders/${sellerId}`)
        if (ordersResponse.ok && isMounted) {
          const ordersData = await ordersResponse.json()
          // Count orders that are not delivered or cancelled
          const pendingOrders = ordersData.filter((order: any) => 
            order.status !== 'Delivered' && order.status !== 'Cancelled'
          )
          setOrderCount(pendingOrders.length)
        }

        // Fetch messages count (unread messages)
        const messagesResponse = await fetch(`http://localhost:8080/api/chat/conversations/seller/${sellerId}`)
        if (messagesResponse.ok && isMounted) {
          const conversationsData = await messagesResponse.json()
          // Sum up all unread counts
          const totalUnread = conversationsData.reduce((sum: number, conv: any) => 
            sum + (conv.unreadCount || 0), 0
          )
          setMessageCount(totalUnread)
        }
      } catch (error) {
        console.error('Error fetching counts:', error)
      }
    }

    fetchCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        fetchCounts()
      }
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    sessionUtils.clearSession()
    toast.success('Logged out successfully')
    navigate('/sellerlogin')
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingPicture(true)
    try {
      const user = sessionUtils.getUser()
      if (!user || user.role !== 'VENDOR') {
        toast.error('Please login as a vendor to upload profile picture')
        return
      }

      const sellerId = user.userId
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`http://localhost:8080/api/seller/profile/${sellerId}/picture`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        let avatarUrl = null
        if (data.profilePicture) {
          avatarUrl = data.profilePicture.startsWith('http')
            ? data.profilePicture
            : `http://localhost:8080${data.profilePicture}`
        }
        setProfilePicture(avatarUrl)
        toast.success('Profile picture updated successfully!')
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('sellerProfilePictureUpdated'))
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to upload profile picture' }))
        toast.error(errorData.message || 'Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('An error occurred while uploading profile picture')
    } finally {
      setUploadingPicture(false)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-8 space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <img src={logo} alt="Local Hunt" className="h-12 w-12 rounded-xl object-contain" />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Local Hunt</p>
            <h2 className="text-lg font-semibold text-gray-900">Seller Hub</h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Seller profile"
                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    // If image fails to load, hide it and show placeholder
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const placeholder = parent.querySelector('.seller-avatar-placeholder') as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              {!profilePicture && (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg font-semibold seller-avatar-placeholder">
                  {sellerName ? sellerName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-red-400 text-white p-1.5 rounded-full hover:bg-red-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  disabled={uploadingPicture}
                  className="hidden"
                />
                {uploadingPicture ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCamera className="w-3 h-3" />
                )}
              </label>
            </div>
            <div>
              <p className="text-sm text-gray-500">Store owner</p>
              <p className="text-lg font-semibold text-gray-900">{sellerName}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
          >
            <FaSignOutAlt className="h-4 w-4" />
            Logout
          </button>
        </div>

        <nav className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Store navigation</h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map(link => (
              <li key={link.label} className="w-full">
                {link.to ? (
                  <Link
                    to={link.to}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 whitespace-nowrap relative"
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    <span className="whitespace-nowrap flex-1">{link.label}</span>
                    {link.label === 'Orders' && orderCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                        {orderCount > 99 ? '99+' : orderCount}
                      </span>
                    )}
                    {link.label === 'Messages' && messageCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                        {messageCount > 99 ? '99+' : messageCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 whitespace-nowrap">
                    <link.icon className="h-5 w-5 shrink-0" />
                    <span className="whitespace-nowrap">{link.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default SellerNavbar