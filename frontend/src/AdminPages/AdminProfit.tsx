import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChartLine, FaRupeeSign } from 'react-icons/fa'
import AdminNavbar from '../AdminComponents/AdminNavbar'

interface ProfitDetail {
  orderId: number
  productName: string
  vendorId?: number
  vendorName: string
  quantity: number
  unitPrice: number
  subtotal: number
  adminCommission: number
  deliveredAt: string
  customerName: string
  paymentMethod: string
}

const AdminProfit = () => {
  const navigate = useNavigate()
  const [totalCommission, setTotalCommission] = useState<number | null>(null)
  const [profitDetails, setProfitDetails] = useState<ProfitDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, detailsRes] = await Promise.all([
        fetch('http://localhost:8080/api/admin/dashboard/stats'),
        fetch('http://localhost:8080/api/admin/profit-details'),
      ])
      if (statsRes.ok) {
        const stats = await statsRes.json()
        setTotalCommission(stats.totalCommission ?? 0)
      }
      if (detailsRes.ok) {
        const details = await detailsRes.json()
        setProfitDetails(details)
      }
    } catch {
      setTotalCommission(0)
      setProfitDetails([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
        <AdminNavbar />
        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                Profit
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Profit & Commission</h1>
                <p className="text-sm text-gray-500">
                  20% commission on every delivered product. Earned only when orders are delivered.
                </p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Loading profit data...</div>
          ) : (
            <>
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <FaRupeeSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Total Commission</h2>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                      NRP {totalCommission != null ? totalCommission.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <FaChartLine className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">Profit & Product Income</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Detailed breakdown of every delivered product — product income and your 20% commission.
                    </p>
                    <div className="mt-4 overflow-x-auto">
                      {profitDetails.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">No delivered orders yet. Profit appears here when products are delivered.</div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Product Income</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Your Commission (20%)</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Delivered</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {profitDetails.map((row) => (
                              <tr key={row.orderId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.productName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {row.vendorId ? (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/adminvendordetail/${row.vendorId}`)}
                                      className="hover:underline cursor-pointer text-left"
                                    >
                                      {row.vendorName}
                                    </button>
                                  ) : (
                                    row.vendorName
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{row.customerName}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-600">{row.quantity}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-600">NRP {row.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">NRP {row.subtotal.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">NRP {row.adminCommission.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    (row.paymentMethod || '').toLowerCase().includes('esewa')
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {(row.paymentMethod || '').toLowerCase().includes('esewa') ? 'e-sewa' : 'COD'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.deliveredAt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminProfit
