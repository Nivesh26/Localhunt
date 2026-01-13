import { useState } from 'react'
import {
  FaFilter,
  FaSearch,
  FaPaperPlane,
  FaPrint,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'

const orders = [
  {
    id: '#S-9827',
    customer: 'Sanjay Gurung',
    items: 3,
    total: 'NRP 3,450',
    status: 'Ready to ship',
    paymentStatus: 'Online',
    shipping: 'Pathao',
    submitted: 'Today • 18m ago',
    fulfillmentDue: '',
    address: 'Lalitpur, Kathmandu',
    note: '',
  },
  {
    id: '#S-9822',
    customer: 'Meena KC',
    items: 1,
    total: 'NRP 1,800',
    status: 'Delivered',
    paymentStatus: 'Cash',
    shipping: 'Courier',
    submitted: 'Today • 2h ago',
    fulfillmentDue: '',
    address: 'Pokhara, Kaski',
    note: '',
  },
  {
    id: '#S-9819',
    customer: 'Global Crafts UK',
    items: 7,
    total: 'NRP 12,900',
    status: 'In transit',
    paymentStatus: 'Online',
    shipping: 'Courier',
    submitted: 'Today • 5h ago',
    fulfillmentDue: '',
    address: 'Birmingham, UK',
    note: '',
  },
  {
    id: '#S-9813',
    customer: 'Solar Collective',
    items: 4,
    total: 'NRP 6,400',
    status: 'Awaiting payment',
    paymentStatus: 'Cash',
    shipping: 'Pathao',
    submitted: 'Yesterday • 4h ago',
    fulfillmentDue: '',
    address: 'Butwal, Rupandehi',
    note: '',
  },
]

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-700',
  'Ready to ship': 'bg-amber-50 text-amber-700',
  'In transit': 'bg-blue-50 text-blue-700',
  'Awaiting payment': 'bg-rose-50 text-rose-700',
}

const SellerOrder = () => {
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<'All' | keyof typeof statusColors | 'Issues'>('All')

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) || order.id.toLowerCase().includes(search.toLowerCase())

    if (activeStatus === 'All') return matchesSearch
    if (activeStatus === 'Issues') return matchesSearch && order.status === 'Awaiting payment'
    return matchesSearch && order.status === activeStatus
  })

  const statusFilters = [
    { label: 'All', value: 'All', count: orders.length },
    { label: 'Ready to ship', value: 'Ready to ship', count: orders.filter(o => o.status === 'Ready to ship').length },
    { label: 'In transit', value: 'In transit', count: orders.filter(o => o.status === 'In transit').length },
    { label: 'Delivered', value: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
    { label: 'Issues', value: 'Issues', count: orders.filter(o => o.status === 'Awaiting payment').length },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Orders
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Manage Seller Orders</h1>
                  <p className="text-sm text-gray-500">
                    Track new orders, print packing slips, and update shipping statuses for your Local Hunt store.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    type="search"
                    placeholder="Search orders or customers"
                    className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FaFilter className="h-4 w-4" />
                  Filter
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  <FaPaperPlane className="h-4 w-4" />
                  Create shipment
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <FaCheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Delivered</p>
                    <p className="text-2xl font-semibold text-gray-900">54</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Payout clears in 2 days</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <FaClock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Ready to ship</p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Need fulfillment within 24h</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <FaExclamationTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Issues</p>
                    <p className="text-2xl font-semibold text-gray-900">3</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Awaiting support response</p>
              </div>
            </div>
          </section>

          

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setActiveStatus(filter.value as typeof activeStatus)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    activeStatus === filter.value ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      activeStatus === filter.value ? 'bg-white text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500">Latest orders from your store, updated in real time.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <FaPrint className="h-4 w-4" />
                Print packing slips
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Shipping</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{order.id}</p>
                          <p className="text-xs text-gray-400">{order.submitted}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{order.customer}</p>
                          <p className="text-xs text-gray-400">{order.address}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{order.items}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{order.total}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              order.paymentStatus === 'Online'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{order.shipping}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                            <p className="text-[11px] text-gray-500">{order.fulfillmentDue}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                              Update status
                            </button>
                            <button className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                              Message buyer
                            </button>
                          </div>
                          {order.note && <p className="mt-2 text-[11px] text-gray-400">{order.note}</p>}
                        </td>
                      </tr>
                    ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No orders yet. Your new sales will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerOrder