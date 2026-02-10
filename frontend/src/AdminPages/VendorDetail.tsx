import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import { FaArrowLeft, FaStore, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaAlignLeft, FaPowerOff, FaPlay } from 'react-icons/fa'
import { toast } from 'react-toastify'

interface VendorDetail {
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
  storeDescription?: string
  businessRegistrationCertificate?: string
  panVatCertificate?: string
  profilePicture?: string
}

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchVendorDetail()
    }
  }, [id])

  const fetchVendorDetail = async () => {
    setLoading(true)
    try {
      // Fetch both list data (for certificates) and profile data (for store description)
      const [listResponse, profileResponse] = await Promise.all([
        fetch('http://localhost:8080/api/seller/approved'),
        fetch(`http://localhost:8080/api/seller/profile/${id}`)
      ])

      if (listResponse.ok && profileResponse.ok) {
        const listData = await listResponse.json()
        const profileData = await profileResponse.json()
        
        const vendorData = listData.find((v: VendorDetail) => v.id === Number(id))
        if (vendorData) {
          // Merge profile data (storeDescription, closedByAdmin) with list data
          setVendor({
            ...vendorData,
            storeDescription: profileData.storeDescription || '',
            closedByAdmin: profileData.closedByAdmin ?? vendorData.closedByAdmin,
            profilePicture: profileData.profilePicture
          })
        } else {
          toast.error('Vendor not found')
          navigate('/adminvendors')
        }
      } else {
        toast.error('Failed to fetch vendor details')
        navigate('/adminvendors')
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error)
      toast.error('An error occurred while fetching vendor details')
      navigate('/adminvendors')
    } finally {
      setLoading(false)
    }
  }

  const formatDocumentUrl = (url: string | undefined) => {
    if (!url) return null
    return url.startsWith('http') 
      ? url 
      : `http://localhost:8080${url.startsWith('/') ? url : '/' + url}`
  }

  const isPdf = (url: string) => {
    return url.toLowerCase().endsWith('.pdf')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
          <AdminNavbar />
          <main className="flex-1">
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading vendor details...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return null
  }

  const businessRegUrl = formatDocumentUrl(vendor.businessRegistrationCertificate)
  const panVatUrl = formatDocumentUrl(vendor.panVatCertificate)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <button
              onClick={() => navigate('/adminvendors')}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back to Vendors
            </button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {vendor.profilePicture ? (
                  <img
                    src={vendor.profilePicture.startsWith('http') ? vendor.profilePicture : `http://localhost:8080${vendor.profilePicture}`}
                    alt={vendor.userName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`h-full w-full flex items-center justify-center text-2xl font-semibold text-gray-500 ${vendor.profilePicture ? 'hidden' : ''}`}>
                  {vendor.userName?.charAt(0).toUpperCase() || 'V'}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
                <p className="text-sm text-gray-500">Vendor Details and Certificates</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Vendor Information */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">Vendor Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FaStore className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="text-base font-medium text-gray-900">{vendor.businessName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaUser className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="text-base font-medium text-gray-900">{vendor.userName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaEnvelope className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{vendor.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaPhone className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-base font-medium text-gray-900">{vendor.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-base font-medium text-gray-900">{vendor.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Business Location</p>
                    <p className="text-base font-medium text-gray-900">{vendor.businessLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaStore className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-base font-medium text-gray-900">{vendor.businessCategory}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaFileAlt className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">PAN / VAT ID</p>
                    <p className="text-base font-medium text-gray-900">{vendor.businessPanVat}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5"></div>
                  <div>
                    <p className="text-sm text-gray-500">Store Status</p>
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {vendor.closedByAdmin ? (
                        <button
                          onClick={async () => {
                            if (!window.confirm('Reopen this vendor\'s store?')) return
                            const prev = vendor
                            setVendor(v => v ? { ...v, storeStatus: true, closedByAdmin: false } : null)
                            toast.success('Vendor store reopened.')
                            try {
                              const res = await fetch(`http://localhost:8080/api/admin/vendors/${vendor.id}/reopen`, { method: 'PUT' })
                              const data = await res.json()
                              if (!res.ok || !data.success) {
                                setVendor(prev)
                                toast.error(data.message || 'Failed to reopen')
                              }
                            } catch {
                              setVendor(prev)
                              toast.error('Failed to reopen')
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                        >
                          <FaPlay className="h-3.5 w-3.5" /> Reopen
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (!window.confirm('Close this vendor\'s store? Vendor will receive an email and cannot reopen until you do.')) return
                            const prev = vendor
                            setVendor(v => v ? { ...v, storeStatus: false, closedByAdmin: true } : null)
                            toast.success('Vendor store closed.')
                            try {
                              const res = await fetch(`http://localhost:8080/api/admin/vendors/${vendor.id}/close`, { method: 'PUT' })
                              const data = await res.json()
                              if (!res.ok || !data.success) {
                                setVendor(prev)
                                toast.error(data.message || 'Failed to close')
                              }
                            } catch {
                              setVendor(prev)
                              toast.error('Failed to close')
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                        >
                          <FaPowerOff className="h-3.5 w-3.5" /> Close Store
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {vendor.storeDescription && (
                  <div className="flex items-start gap-3">
                    <FaAlignLeft className="mt-1 h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">Store Description</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{vendor.storeDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Certificates */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">Certificates</h2>
              <div className="space-y-6">
                {/* Business Registration Certificate */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Business Registration Certificate</h3>
                  {businessRegUrl ? (
                    <div className="relative">
                      {isPdf(businessRegUrl) ? (
                        <iframe
                          src={businessRegUrl}
                          className="w-full h-96 rounded-lg border border-gray-200 shadow-sm"
                          title="Business Registration Certificate"
                        />
                      ) : (
                        <img
                          src={businessRegUrl}
                          alt="Business Registration Certificate"
                          className="w-full rounded-lg border border-gray-200 shadow-sm"
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
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not provided</p>
                  )}
                </div>

                {/* PAN / VAT Certificate */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">PAN / VAT Certificate</h3>
                  {panVatUrl ? (
                    <div className="relative">
                      {isPdf(panVatUrl) ? (
                        <iframe
                          src={panVatUrl}
                          className="w-full h-96 rounded-lg border border-gray-200 shadow-sm"
                          title="PAN / VAT Certificate"
                        />
                      ) : (
                        <img
                          src={panVatUrl}
                          alt="PAN / VAT Certificate"
                          className="w-full rounded-lg border border-gray-200 shadow-sm"
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
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not provided</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default VendorDetail
