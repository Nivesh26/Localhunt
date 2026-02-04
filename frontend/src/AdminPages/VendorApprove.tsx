import { useState, useEffect } from 'react'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import {
  FaSearch,
  FaCheckCircle,
  FaTimes,
} from 'react-icons/fa'
import { toast } from 'react-toastify'

interface SellerRequest {
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
  businessRegistrationCertificate?: string
  panVatCertificate?: string
}

const VendorApprove = () => {
  const [vendorRequests, setVendorRequests] = useState<SellerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    fetchPendingSellers()
  }, [])

  const fetchPendingSellers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/seller/pending')
      if (response.ok) {
        const data = await response.json()
        setVendorRequests(data)
      } else {
        toast.error('Failed to fetch pending sellers')
      }
    } catch (error) {
      console.error('Error fetching pending sellers:', error)
      toast.error('An error occurred while fetching seller requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (sellerId: number) => {
    if (!window.confirm('Are you sure you want to approve this seller?')) {
      return
    }

    setProcessing(sellerId)
    try {
      const response = await fetch(`http://localhost:8080/api/seller/${sellerId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Seller approved successfully!')
        // Remove approved seller from the list
        setVendorRequests(prev => prev.filter(seller => seller.id !== sellerId))
      } else {
        toast.error(data.message || 'Failed to approve seller')
      }
    } catch (error) {
      console.error('Error approving seller:', error)
      toast.error('An error occurred while approving the seller')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (sellerId: number) => {
    if (!window.confirm('Are you sure you want to reject this seller? This action cannot be undone.')) {
      return
    }

    setProcessing(sellerId)
    try {
      const response = await fetch(`http://localhost:8080/api/seller/${sellerId}/reject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Seller rejected successfully')
        // Remove rejected seller from the list
        setVendorRequests(prev => prev.filter(seller => seller.id !== sellerId))
      } else {
        toast.error(data.message || 'Failed to reject seller')
      }
    } catch (error) {
      console.error('Error rejecting seller:', error)
      toast.error('An error occurred while rejecting the seller')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 3600) {
        return 'Just now'
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} ${days === 1 ? 'day' : 'days'} ago`
      }
    } catch (error) {
      return 'Unknown'
    }
  }

  const filteredRequests = vendorRequests.filter(request => {
    const search = searchTerm.toLowerCase()
    return (
      request.businessName.toLowerCase().includes(search) ||
      request.userName.toLowerCase().includes(search) ||
      request.contactEmail.toLowerCase().includes(search) ||
      request.businessCategory.toLowerCase().includes(search)
    )
  })


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Approve Vendor Requests</h1>
                <p className="text-sm text-gray-500">
                  Review and action new vendor onboarding submissions to keep the marketplace trusted.
                </p>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading pending sellers...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">
                {searchTerm ? 'No sellers found matching your search.' : 'No pending seller requests at this time.'}
              </p>
            </div>
          ) : (
            <section className="space-y-4">
              {filteredRequests.map(request => (
                <article key={request.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          #{request.id}
                        </span>
                        <p className="text-sm text-gray-400">
                          Submitted {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-gray-900">{request.businessName}</h2>
                      <p className="text-sm text-gray-500">Owner: {request.userName}</p>
                      <p className="mt-1 text-sm text-gray-500">Email: {request.contactEmail}</p>
                      <p className="mt-1 text-sm text-gray-500">Phone: {request.phoneNumber}</p>
                      <p className="mt-1 text-sm text-gray-500">Category: {request.businessCategory}</p>
                      <p className="mt-1 text-sm text-gray-500">Location: {request.location}</p>
                      <p className="mt-1 text-sm text-gray-500">Business Location: {request.businessLocation}</p>
                      <p className="mt-1 text-sm text-gray-500">PAN/VAT: {request.businessPanVat}</p>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Business Registration Certificate</h3>
                          {request.businessRegistrationCertificate ? (
                            <div className="relative">
                              {(() => {
                                const docUrl = request.businessRegistrationCertificate.startsWith('http') 
                                  ? request.businessRegistrationCertificate 
                                  : `http://localhost:8080${request.businessRegistrationCertificate.startsWith('/') ? request.businessRegistrationCertificate : '/' + request.businessRegistrationCertificate}`
                                const isPdf = docUrl.toLowerCase().endsWith('.pdf')
                                return isPdf ? (
                                  <iframe
                                    src={docUrl}
                                    className="w-full max-w-md h-96 rounded-lg border border-gray-200 shadow-sm"
                                    title="Business Registration Certificate"
                                  />
                                ) : (
                                  <img
                                    src={docUrl}
                                    alt="Business Registration Certificate"
                                    className="max-w-md rounded-lg border border-gray-200 shadow-sm"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = ''
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.innerHTML = '<p class="text-sm text-gray-500">Document not available</p>'
                                      }
                                    }}
                                  />
                                )
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">PAN / VAT Certificate</h3>
                          {request.panVatCertificate ? (
                            <div className="relative">
                              {(() => {
                                const docUrl = request.panVatCertificate.startsWith('http') 
                                  ? request.panVatCertificate 
                                  : `http://localhost:8080${request.panVatCertificate.startsWith('/') ? request.panVatCertificate : '/' + request.panVatCertificate}`
                                const isPdf = docUrl.toLowerCase().endsWith('.pdf')
                                return isPdf ? (
                                  <iframe
                                    src={docUrl}
                                    className="w-full max-w-md h-96 rounded-lg border border-gray-200 shadow-sm"
                                    title="PAN / VAT Certificate"
                                  />
                                ) : (
                                  <img
                                    src={docUrl}
                                    alt="PAN / VAT Certificate"
                                    className="max-w-md rounded-lg border border-gray-200 shadow-sm"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = ''
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.innerHTML = '<p class="text-sm text-gray-500">Document not available</p>'
                                      }
                                    }}
                                  />
                                )
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-64">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaCheckCircle className="h-5 w-5" />
                        {processing === request.id ? 'Processing...' : 'Approve Vendor'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processing === request.id}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaTimes className="h-5 w-5" />
                        {processing === request.id ? 'Processing...' : 'Reject Request'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default VendorApprove
