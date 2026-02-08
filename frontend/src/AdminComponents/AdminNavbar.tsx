import {
  FaHome,
  FaStore,
  FaCube,
  FaChartLine,
  FaShieldAlt,
  FaSignOutAlt,
  FaUsers,
  FaStar,
  FaBars,
  FaTimes,
} from 'react-icons/fa'
import logo from '../assets/Local Hunt Logo NoBG.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { sessionUtils } from '../utils/sessionUtils'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Overview', icon: FaHome, to: '/admindashboard' },
  { label: 'Users', icon: FaUsers, to: '/adminuser' },
  { label: 'Vendors', icon: FaStore, to: '/adminvendors' },
  { label: 'Approve Vendors', icon: FaShieldAlt, to: '/adminvendorsapprove' },
  { label: 'Products', icon: FaCube, to: '/adminproducts' },
  { label: 'Profit', icon: FaChartLine, to: '/adminprofit' },
  { label: 'Reviews', icon: FaStar, to: '/adminreviews' },
  { label: 'Settings', icon: FaShieldAlt, to: '/adminsettings' },
]



const AdminNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingVendorCount, setPendingVendorCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchPendingVendorCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingVendorCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingVendorCount = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/seller/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingVendorCount(data.length)
      }
    } catch (error) {
      console.error('Error fetching pending vendor count:', error)
    }
  }

  const handleLogout = () => {
    sessionUtils.clearSession(true)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navContent = (
    <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <img src={logo} alt="Local Hunt" className="h-12 w-12 rounded-xl object-contain" />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Local Hunt</p>
            <h2 className="text-lg font-semibold text-gray-900">Marketplace Admin</h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Marketplace Admin</p>
            <p className="text-lg font-semibold text-gray-900">Super Admin</p>
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Control Center</h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map(link => {
                const isActive = location.pathname === link.to
                return (
              <li key={link.label} className="w-full">
                {link.to ? (
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition whitespace-nowrap relative ${
                      isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    <span className="whitespace-nowrap flex-1">{link.label}</span>
                    {link.label === 'Approve Vendors' && pendingVendorCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                        {pendingVendorCount > 99 ? '99+' : pendingVendorCount}
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
            )})}
          </ul>
        </nav>
    </div>
  )

  return (
    <>
      {/* Mobile Header - visible on lg and below */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-40 flex items-center justify-between px-4">
        <Link to="/admindashboard" className="flex items-center gap-2">
          <img src={logo} alt="Local Hunt" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-gray-900">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-16">{navContent}</div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-8">{navContent}</div>
      </aside>
    </>
  )
}

export default AdminNavbar
