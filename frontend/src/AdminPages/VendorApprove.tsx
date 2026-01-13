import AdminNavbar from '../AdminComponents/AdminNavbar'
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimes,
  FaDownload,
} from 'react-icons/fa'

const vendorRequests = [
  {
    id: '#A1',
    store: 'Nepal Handicrafts',
    owner: 'Nivesh Shrestha',
    submitted: '2 hours ago',
    notes: 'Handmade rugs and decor curated from Kathmandu valley artisans.',
    documents: ['Business Registration', 'PAN Certificate'],
  },
  {
    id: '#A2',
    store: 'Kathmandu Organics',
    owner: 'Aaloka Poudel',
    submitted: 'Yesterday',
    notes: 'Organic spice mixes and wellness teas sourced from local farms.',
    documents: [ 'Business Registration','VAT Certificate'],
  },
  {
    id: '#A3  ',
    store: 'Sherpa Leather Co.',
    owner: 'Nima Sherpa',
    submitted: '3 days ago',
    notes: 'Premium leather goods crafted in Solukhumbu.',
    documents: ['Business Registration'],
  },
]

const VendorApprove = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
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

          <section className="space-y-4">
            {vendorRequests.map(request => (
              <article key={request.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{request.id}</span>
                      <p className="text-sm text-gray-400">Submitted {request.submitted}</p>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-gray-900">{request.store}</h2>
                    <p className="text-sm text-gray-500">Owner: {request.owner}</p>
                    <p className="mt-3 text-sm text-gray-700">{request.notes}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                      {request.documents.map(doc => (
                        <span key={doc} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                          <FaDownload className="h-4 w-4 text-gray-400" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-64">
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                      <FaCheckCircle className="h-5 w-5" />
                      Approve Vendor
                    </button>
                    <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      Hold Request
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      <FaTimes className="h-5 w-5" />
                      Reject Request
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

export default VendorApprove
