import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import { FaArrowLeft, FaStore, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaAlignLeft } from 'react-icons/fa'
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
  storeDescription?: string
  businessRegistrationCertificate?: string
  panVatCertificate?: string
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
          // Merge profile data (storeDescription) with list data
          setVendor({
            ...vendorData,
            storeDescription: profileData.storeDescription || ''
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
              <p className="text-sm text-gray-500">Vendor Details and Certificates</p>
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      vendor.storeStatus 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        vendor.storeStatus ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></div>
                      {vendor.storeStatus ? 'Open' : 'Closed'}
                    </span>
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
