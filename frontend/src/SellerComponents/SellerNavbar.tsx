import {
  FaHome,
  FaCube,
  FaShoppingBag,
  FaMoneyBillWave,
  FaComments,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import logo from '../assets/Local Hunt Logo NoBG.png'
import profileImage from '../assets/Nivesh.png'

const navLinks = [
  { label: 'Overview', icon: FaHome, to: '/sellerdashboard' },
  { label: 'Products', icon: FaCube, to: '/sellerproduct' },
  { label: 'Orders', icon: FaShoppingBag, to: '/sellerorder' },
  { label: 'Payouts', icon: FaMoneyBillWave, to: '/sellerpayout' },
  { label: 'Messages', icon: FaComments, to: '/sellermessage' },
  { label: 'Settings', icon: FaCog, to: '/sellersetting' },
]

const SellerNavbar = () => {
  return (
    <aside className="hidden w-64 lg:block">
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
            <img src={profileImage} alt="Seller profile" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="text-sm text-gray-500">Store owner</p>
              <p className="text-lg font-semibold text-gray-900">Mr. Nivesh Shrestha</p>
            </div>
          </div>

          <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
            <FaSignOutAlt className="h-4 w-4" />
            Switch to buying
          </button>
        </div>

        <nav className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Store navigation</h3>
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

export default SellerNavbar