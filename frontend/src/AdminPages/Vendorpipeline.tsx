import AdminNavbar from '../AdminComponents/AdminNavbar'
import {
  FaUserPlus,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaUpload,
  FaShieldAlt,
  FaChartLine,
} from 'react-icons/fa'

const pendingApplications = [
  {
    store: 'Sherpa Leather',
    owner: 'Nivesh Shrestha',
    age: '2 hours ago',
    risk: 'Medium',
  },
  {
    store: 'Himalayan Tea Collective',
    owner: 'Aaloka Poudel',
    age: '4 hours ago',
    risk: 'Low',
  },
  {
    store: 'Evergreen Spices',
    owner: 'Hacker',
    age: 'Yesterday',
    risk: 'High',
  },
]

const checklistItems = [
  { label: 'Verify business credentials', icon: FaShieldAlt },
  { label: 'Review product catalog & compliance', icon: FaCheckCircle },
  { label: 'Assess fulfillment & logistics readiness', icon: FaClock },
  { label: 'Enable payouts & tax configuration', icon: FaUpload },
]

const Vendorpipeline = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Onboarding Pipeline</h1>
                <p className="text-sm text-gray-500">Track, review, and activate multi-vendor applications in one place.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* <button className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                  <FaUserPlus className="h-5 w-5" />
                  Add New Vendor
                </button>
                <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Download Pipeline Report
                </button> */}
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pending Applications</h2>
                  <p className="text-sm text-gray-500">Review documents and risk profile before approval.</p>
                </div>
                <FaClock className="h-6 w-6 text-amber-500" />
              </div>

              <div className="mt-5 space-y-4">
                {pendingApplications.map(application => (
                  <div key={application.store} className="rounded-xl border border-gray-100 p-4 hover:border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{application.store}</p>
                        <p className="text-xs text-gray-500">Owner: {application.owner}</p>
                        <p className="mt-1 text-xs text-gray-400">Submitted {application.age}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          application.risk === 'High'
                            ? 'bg-red-50 text-red-600'
                            : application.risk === 'Medium'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {application.risk} Risk
                      </span>
                    </div>

            

                    <div className="mt-4 flex items-center gap-2">
                      <button className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600">
                        <FaCheckCircle className="h-4 w-4" />
                        Approve Vendor
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        Request Docs
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                        <FaTimes className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Verification Workflow</h2>
              <p className="text-sm text-gray-500">Ensure every vendor meets marketplace compliance.</p>
              <ul className="mt-4 space-y-3">
                {checklistItems.map(step => (
                  <li key={step.label} className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
                    <step.icon className="h-6 w-6 text-red-500" />
                    <p className="text-sm text-gray-700">{step.label}</p>
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">
                View SOP Checklist
              </button>
            </article>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pipeline Health</h2>
                <p className="text-sm text-gray-500">Today’s onboarding metrics across the funnel.</p>
              </div>
              <FaChartLine className="h-6 w-6 text-green-500" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900">Applications in Review</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">48</p>
                <p className="text-xs text-gray-500">+12 since yesterday</p>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-red-500" style={{ width: '60%' }} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900">Average Approval Time</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">36h</p>
                <p className="text-xs text-gray-500">Target 24h</p>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900">Activation Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">82%</p>
                <p className="text-xs text-gray-500">Last 14 days</p>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Vendorpipeline
