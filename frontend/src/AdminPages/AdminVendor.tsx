import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import {
  FaSearch,
  FaTrash,
  FaEye,
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
  storeStatus: boolean
  closedByAdmin?: boolean
  businessRegistrationCertificate?: string
  panVatCertificate?: string
}

const AdminVender = () => {
  const navigate = useNavigate()
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

  const handleDelete = async (vendorId: number) => {
    const shouldDelete = window.confirm(
      'Permanently delete this vendor? All their products, orders, reviews, chat history, and data will be completely removed from the database. This cannot be undone.'
    )
    if (!shouldDelete) return

    try {
      const response = await fetch(`http://localhost:8080/api/admin/vendors/${vendorId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Remove from local state
        setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId))
        toast.success('Vendor and all their products deleted successfully')
      } else {
        toast.error(data.message || 'Failed to delete vendor')
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error('An error occurred while deleting the vendor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
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
                      <th className="py-2 pr-6 font-medium">Store Status</th>
                      <th className="py-2 pr-6 text-right font-medium">Actions</th>
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
                        <td className="py-3 pr-6">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            vendor.storeStatus 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : vendor.closedByAdmin ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              vendor.storeStatus ? 'bg-emerald-500' : vendor.closedByAdmin ? 'bg-amber-500' : 'bg-red-500'
                            }`}></div>
                            {vendor.storeStatus ? 'Open' : vendor.closedByAdmin ? 'Closed by Admin' : 'Closed'}
                          </span>
                        </td>
                        <td className="py-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/adminvendordetail/${vendor.id}`)}
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                              <FaEye className="h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(vendor.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <FaTrash className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
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
