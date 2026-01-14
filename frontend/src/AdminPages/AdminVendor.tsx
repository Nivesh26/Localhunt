import { useState, useEffect } from 'react'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import {
  FaSearch,
  FaFilter,
} from 'react-icons/fa'
import { toast } from 'react-toastify'

interface Vendor {
  id: number
  userName: string
  phoneNumber: string
  contactEmail: string
  location: string
  businessName: string
  businessCategory: string
  businessPanVat: string
  businessLocation: string
  createdAt: string
  approved: boolean
}

const AdminVender = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchApprovedVendors()
  }, [])

  const fetchApprovedVendors = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/seller/approved')
      if (response.ok) {
        const data = await response.json()
        setVendors(data)
      } else {
        toast.error('Failed to fetch vendors')
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('An error occurred while fetching vendors')
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const search = searchTerm.toLowerCase()
    return (
      vendor.businessName.toLowerCase().includes(search) ||
      vendor.userName.toLowerCase().includes(search) ||
      vendor.businessCategory.toLowerCase().includes(search)
    )
  })

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

            {loading ? (
              <div className="mt-5 flex items-center justify-center py-12">
                <div className="text-gray-500">Loading vendors...</div>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="mt-5 flex items-center justify-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? 'No vendors found matching your search.' : 'No approved vendors at this time.'}
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="py-2 pr-6 font-medium">Vendor</th>
                      <th className="py-2 pr-6 font-medium">Owner</th>
                      <th className="py-2 pr-6 font-medium">Category</th>
                      <th className="py-2 pr-6 font-medium">Location</th>
                      <th className="py-2 pr-6 font-medium">Email</th>
                      <th className="py-2 pr-6 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredVendors.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-6 font-semibold text-gray-900">{vendor.businessName}</td>
                        <td className="py-3 pr-6">{vendor.userName}</td>
                        <td className="py-3 pr-6">{vendor.businessCategory}</td>
                        <td className="py-3 pr-6">{vendor.businessLocation}</td>
                        <td className="py-3 pr-6 text-sm text-gray-600">{vendor.contactEmail}</td>
                        <td className="py-3 pr-6 text-sm text-gray-600">{vendor.phoneNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  )
}

export default AdminVender
