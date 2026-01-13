import AdminNavbar from '../AdminComponents/AdminNavbar'
import {
  FaSearch,
  FaFilter,
} from 'react-icons/fa'
 
const vendors = [
  {
    name: 'Virinchi College',
    owner: 'Hacker',
    category: 'Handmade Decor',
    gmv: 'NRP 48',
    orders: 34,
  },
  {
    name: 'General Mechanical Store',
    owner: 'Nivesh Shrestha',
    category: 'Workshop',
    gmv: 'NRP 37',
    orders: 1000,
  },
  {
    name: 'Momomia Cafe',
    owner: 'Meric Sapkota',
    category: 'Apparel & Accessories',
    gmv: 'NRP 2900',
    orders: 198,
  },
  {
    name: 'Lumbini Herbal Store',
    owner: 'Aaloka Poudel',
    category: 'Textiles',
    gmv: 'NRP 22,780',
    orders: 164,
  },
]
 
const AdminVender = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Vendors</h1>
                <p className="text-sm text-gray-500">Browse approved marketplace vendors and their performance metrics.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search vendor or owner name..."
                    className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <FaFilter className="h-5 w-5" />
                  Filters
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Marketplace Vendor Directory</h2>
            <p className="text-sm text-gray-500">List of all active vendors on Local Hunt with recent performance.</p>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-2 pr-6 font-medium">Vendor</th>
                    <th className="py-2 pr-6 font-medium">Owner</th>
                    <th className="py-2 pr-6 font-medium">Category</th>
                    <th className="py-2 pr-6 font-medium">GMV (30d)</th>
                    <th className="py-2 pr-6 font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {vendors.map(vendor => (
                    <tr key={vendor.name} className="hover:bg-gray-50">
                      <td className="py-3 pr-6 font-semibold text-gray-900">{vendor.name}</td>
                      <td className="py-3 pr-6">{vendor.owner}</td>
                      <td className="py-3 pr-6">{vendor.category}</td>
                      <td className="py-3 pr-6">{vendor.gmv}</td>
                      <td className="py-3 pr-6">{vendor.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
 
export default AdminVender
