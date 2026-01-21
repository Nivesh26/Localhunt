import {
  FaHome,
  FaStore,
  FaCube,
  FaShieldAlt,
  FaSignOutAlt,
  FaUsers,
} from 'react-icons/fa'
import logo from '../assets/Local Hunt Logo NoBG.png'
import { Link, useNavigate } from 'react-router-dom'
import { sessionUtils } from '../utils/sessionUtils'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Overview', icon: FaHome, to: '/admindashboard' },
  { label: 'Users', icon: FaUsers, to: '/adminuser' },
  { label: 'Vendors', icon: FaStore, to: '/adminvendors' },
  { label: 'Approve Vendors', icon: FaShieldAlt, to: '/adminvendorsapprove' },
  { label: 'Products', icon: FaCube, to: '/adminproducts' },
  { label: 'Settings', icon: FaShieldAlt, to: '/adminsettings' },
 
]



const AdminNavbar = () => {
  const navigate = useNavigate()
  const [pendingVendorCount, setPendingVendorCount] = useState(0)

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
    sessionUtils.clearSession()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-8 space-y-6">
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
            {navLinks.map(link => (
              <li key={link.label} className="w-full">
                {link.to ? (
                  <Link
                    to={link.to}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 whitespace-nowrap relative"
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
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default AdminNavbar
