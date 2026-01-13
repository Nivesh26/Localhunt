import {
  FaCube,
  FaDollarSign,
  FaShieldAlt,
  FaStore,
  FaTicketAlt,
  FaBell,
  FaSearch,
  FaSignOutAlt,
} from 'react-icons/fa'
import AdminNavbar from '../AdminComponents/AdminNavbar'

const AdminDashboard = () => {
  const statCards = [
    { label: 'Total Vendors', value: '10',  icon: FaStore, color: 'bg-red-500' },
    { label: 'Active Products', value: '18',  icon: FaCube, color: 'bg-blue-500' },
    { label: 'GMV (30d)', value: 'NRP 4000',  icon: FaDollarSign, color: 'bg-green-500' },
    { label: 'Pending Verifications', value: '32', icon: FaShieldAlt, color: 'bg-amber-500' },
  ]

  const topVendors = [
    { name: 'Virinchi College', category: 'Handmade', orders: 982, growth: '+18%', rating: 4.9 },
    { name: 'General Mechanical Store', category: 'Gourmet Foods', orders: 756, growth: '+12%', rating: 4.8 },
    { name: 'Momomia Cafe', category: 'Apparel', orders: 604, growth: '+9%', rating: 4.7 },
    { name: 'Lumbini Herbal Store', category: 'Home Decor', orders: 488, growth: '+7%', rating: 4.6 },
  ]

  const onboardingRequests = [
    { store: 'Nepal Spice Hub', owner: 'Meera Thapa', submitted: '2h ago', docs: 'GST & Bank Statement', status: 'High Priority' },
    { store: 'Sherpa Leather', owner: 'Nima Sherpa', submitted: '5h ago', docs: 'ID Pending', status: 'Follow-up' },
    { store: 'EcoLife Essentials', owner: 'Anil Shrestha', submitted: 'Yesterday', docs: 'Complete', status: 'Ready to Approve' },
  ]

  const supportTickets = [
    { id: '#4527', vendor: 'Mountain Brew Co.', topic: 'Payout Delay', priority: 'High', time: '14m ago' },
    { id: '#4522', vendor: 'Lotus Crafts', topic: 'Listing Visibility', priority: 'Medium', time: '1h ago' },
    { id: '#4519', vendor: 'Summit Gear', topic: 'Return Dispute', priority: 'High', time: '2h ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminNavbar />

        {/* Main content */}
        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">Admin</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Marketplace Control Center</h1>
                  <p className="text-sm text-gray-500">Track vendor performance, approvals, payouts, and customer happiness.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search vendors, orders, products..."
                    className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>

                <button className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                  <FaBell className="h-5 w-5" />
                  Alerts
                </button>

                <button className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  <FaSignOutAlt className="h-5 w-5" />
                  Log Out
                </button>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map(card => (
              <article key={card.label} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} rounded-xl p-3 text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Performing Vendors</h2>
                  <p className="text-sm text-gray-500">Performance across fulfillment, ratings, and revenue growth</p>
                </div>
                <button className="text-sm font-medium text-red-600 hover:text-red-700">View analytics</button>
              </div>

              <div className="mt-5 space-y-4">
                {topVendors.map(vendor => (
                  <div key={vendor.name} className="rounded-xl border border-gray-100 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.category}</p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">{vendor.growth}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{vendor.orders} orders</span>
                      <span>Rating {vendor.rating}/5</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, vendor.orders / 10)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Onboarding Queue</h2>
              <p className="text-sm text-gray-500">Vendors awaiting verification or review</p>
              <ul className="mt-4 space-y-4">
                {onboardingRequests.map(request => (
                  <li key={request.store} className="rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-900">{request.store}</p>
                    <p className="text-xs text-gray-500">Owner: {request.owner}</p>
                    <p className="text-xs text-gray-500">Documents: {request.docs}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-400">{request.submitted}</span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-600">{request.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Open vendor pipeline
              </button>
            </article>
          </section>

          {/* <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
                  <p className="text-sm text-gray-500">Vendor requests requiring admin attention</p>
                </div>
                <TicketIcon className="h-6 w-6 text-red-500" />
              </div>
              <ul className="mt-4 space-y-3">
                {supportTickets.map(ticket => (
                  <li key={ticket.id} className="rounded-xl border border-gray-100 px-4 py-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                      <span>{ticket.id}</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{ticket.topic}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                      <span>{ticket.vendor}</span>
                      <span>{ticket.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            
          </section> */}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard