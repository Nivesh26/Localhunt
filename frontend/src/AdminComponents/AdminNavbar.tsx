import {
  FaHome,
  FaStore,
  FaCube,
  FaShieldAlt,
  FaSignOutAlt,
} from 'react-icons/fa'
import logo from '../assets/Local Hunt Logo NoBG.png'
import profileImage from '../assets/Nivesh.png'
import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'Overview', icon: FaHome, to: '/admindashboard' },
  { label: 'Vendors', icon: FaStore, to: '/adminvendors' },
  { label: 'Approve Vendors', icon: FaShieldAlt, to: '/adminvendorsapprove  ' },
  { label: 'Products', icon: FaCube, to: '/adminproducts' },
  { label: 'Settings', icon: FaShieldAlt, to: '/adminsettings' },
]



const AdminNavbar = () => {
  return (
    <aside className="hidden w-64 lg:block">
      
      <div className="sticky top-8 space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <img src={logo} alt="Local Hunt" className="h-12 w-12 rounded-xl object-contain" />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Local Hunt</p>
            <h2 className="text-lg font-semibold text-gray-900">Marketplace Admin</h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={profileImage} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="text-sm text-gray-500">Marketplace Admin</p>
              <p className="text-lg font-semibold text-gray-900">Super Admin</p>
            </div>
          </div>
          
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
            <FaSignOutAlt className="h-4 w-4" />
            Switch Accountt
          </button>
        </div>

        <nav className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Control Center</h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map(link => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ) : (
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600">
                    <link.icon className="h-5 w-5" />
                    {link.label}
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
