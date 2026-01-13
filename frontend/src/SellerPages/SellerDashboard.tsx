import {
  FaMoneyBillWave,
  FaCube,
  FaShoppingBag,
  FaStar,
  FaChartLine,
} from 'react-icons/fa'
import SellerNavbar from '../SellerComponents/SellerNavbar'

const SellerDashboard = () => {
  const statCards = [
    { label: 'Live products', value: '14', change: '+3 this week', icon: FaCube, color: 'bg-red-500' },
    { label: 'Orders (30 days)', value: '128', change: '+24%', icon: FaShoppingBag, color: 'bg-amber-500' },
    { label: 'Payout ready', value: 'NRP 42,300', change: 'Next cycle: Friday', icon: FaMoneyBillWave, color: 'bg-emerald-500' },
    { label: 'Store rating', value: '4.8', change: 'Based on 86 reviews', icon: FaStar, color: 'bg-blue-500' },
  ]

  const topProducts = [
    { name: 'Handwoven Dhaka Scarf', sku: 'DHK-241', price: 'NRP 1,800', sold: 46, stock: 18, trend: '+18%' },
    { name: 'Himalayan Organic Tea Pack', sku: 'TEA-112', price: 'NRP 950', sold: 32, stock: 42, trend: '+12%' },
    { name: 'Lokta Paper Journal', sku: 'LKT-089', price: 'NRP 550', sold: 27, stock: 30, trend: '+9%' },
  ]

  const recentOrders = [
    { id: '#S-9827', customer: 'Sanjay Gurung', items: 3, total: 'NRP 3,450', status: 'Ready to ship', time: '18m ago' },
    { id: '#S-9822', customer: 'Meena KC', items: 1, total: 'NRP 1,800', status: 'Delivered', time: '2h ago' },
    { id: '#S-9819', customer: 'Global Crafts UK', items: 7, total: 'NRP 12,900', status: 'In transit', time: '5h ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        {/* Main content */}
        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Seller
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Store Performance Overview</h1>
                  <p className="text-sm text-gray-500">
                    Monitor orders, earnings, and product performance for your Local Hunt shop.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                  <FaChartLine className="h-5 w-5" />
                  View analytics
                </button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map(card => (
              <article key={card.label} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{card.change}</p>
                  </div>
                  <div className={`${card.color} rounded-xl p-3 text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Products & Orders */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                  <p className="text-sm text-gray-500">Your best-performing items over the last 30 days.</p>
                </div>
                <button className="text-sm font-medium text-red-600 hover:text-red-700">Manage products</button>
              </div>

              <div className="mt-5 space-y-4">
                {topProducts.map(product => (
                  <div key={product.sku} className="rounded-xl border border-gray-100 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                        {product.trend}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{product.sold} units sold</span>
                      <span>{product.stock} in stock</span>
                      <span className="font-semibold text-gray-900">{product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Newest orders from your Local Hunt store.</p>

              <ul className="mt-4 space-y-3 text-sm">
                {recentOrders.map(order => (
                  <li key={order.id} className="rounded-xl border border-gray-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{order.id}</span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{order.customer}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {order.items} item{order.items > 1 ? 's' : ''} • {order.total}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'Ready to ship'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <button className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                View all orders
              </button>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerDashboard