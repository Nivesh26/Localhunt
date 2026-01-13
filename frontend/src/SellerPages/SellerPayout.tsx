import {
  FaMoneyBillWave,
  FaCreditCard,
  FaClock,
  FaDollarSign,
  FaDownload,
  FaShieldAlt,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'

const payoutSummary = [
  {
    label: 'Available balance',
    value: 'NRP 82,400',
    description: 'Ready to withdraw today',
    icon: FaMoneyBillWave,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Next payout date',
    value: '13 Feb, 2025',
    description: 'Weekly schedule • Thursday',
    icon: FaClock,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Pending verification',
    value: 'NRP 14,250',
    description: 'New orders in dispute hold',
    icon: FaShieldAlt,
    color: 'bg-blue-50 text-blue-600',
  },
]

const payouts = [
  {
    id: '#P-4298',
    amount: 'NRP 24,600',
    period: 'Jan 28 – Feb 02',
    method: 'Himalayan Bank • 9991',
    status: 'Settled',
    settledOn: '05 Feb, 09:42',
  },
  {
    id: '#P-4292',
    amount: 'NRP 18,300',
    period: 'Jan 21 – Jan 27',
    method: 'Himalayan Bank • 9991',
    status: 'Settled',
    settledOn: '29 Jan, 10:14',
  },
  {
    id: '#P-4285',
    amount: 'NRP 21,980',
    period: 'Jan 14 – Jan 20',
    method: 'Himalayan Bank • 9991',
    status: 'In review',
    settledOn: 'KYC refresh required',
  },
]

const SellerPayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Payouts
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Financial Control Center</h1>
                  <p className="text-sm text-gray-500">
                    Monitor available balances, upcoming transfers, and historical payouts for your Local Hunt store.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <FaCreditCard className="h-5 w-5 text-gray-500" />
                  Manage bank accounts
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  <FaDollarSign className="h-5 w-5" />
                  Request instant payout
                </button>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {payoutSummary.map(card => (
              <article key={card.label} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl p-3 ${card.color}`}>
                    <card.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400">{card.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent payouts</h2>
                  <p className="text-sm text-gray-500">Weekly settlements to your verified bank account.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <FaDownload className="h-4 w-4" />
                  Export CSV
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Payout</th>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-left">Method</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payouts.map(payout => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{payout.amount}</p>
                          <p className="text-xs text-gray-400">{payout.id}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payout.period}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{payout.method}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                payout.status === 'Settled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {payout.status}
                            </span>
                            <p className="text-[11px] text-gray-400">{payout.settledOn}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            {/* <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Withdrawal preferences</h2>
              <p className="text-sm text-gray-500">Customize how you receive funds from marketplace sales.</p>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Himalayan Bank • 9991</p>
                      <p className="text-xs text-gray-500">Business checking • Primary</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Default</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-center">
                  <p className="text-sm font-semibold text-gray-700">Add secondary payout method</p>
                  <p className="text-xs text-gray-400">Connect another bank, eSewa, or Khalti wallet</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">Compliance status</h3>
                <ul className="mt-3 space-y-2 text-xs text-gray-600">
                  <li className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                    <span>Business KYC</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">Verified</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                    <span>Tax documents</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">Expires in 30d</span>
                  </li>
                </ul>
              </div>
            </article> */}
          </section>
  {/* 
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Helpful links</h2>
                  <p className="text-sm text-gray-500">Resolve payout delays or update compliance documents.</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <button className="rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Contact finance support</button>
                  <button className="rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">View payout policy</button>
                  <button className="rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Download statements</button>
                </div>
              </div>
            </section> */}
        </main>
      </div>
    </div>
  )
}

export default SellerPayout