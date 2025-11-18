import { useState } from 'react'
import {
  BellIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import SellerNavbar from '../SellerComponents/SellerNavbar'

const notificationSettings = [
  { id: 'newOrders', label: 'New orders', description: 'Get notified when customers place new orders.' },
  { id: 'messages', label: 'Customer messages', description: 'Alert me when customers send messages or inquiries.' },
  { id: 'payouts', label: 'Payout updates', description: 'Email me when payouts are processed or delayed.' },
  { id: 'reviews', label: 'Product reviews', description: 'Notify me when customers leave reviews or ratings.' },
  { id: 'lowStock', label: 'Low stock alerts', description: 'Warn me when product inventory falls below threshold.' },
  { id: 'system', label: 'System announcements', description: 'Platform updates, maintenance, and new features.' },
]

const SellerSetting = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    newOrders: true,
    messages: true,
    payouts: true,
    reviews: false,
    lowStock: true,
    system: true,
  })

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <SellerNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white px-6 py-6 shadow-sm sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Store settings</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">Manage Your Store</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Update your store information, security preferences, and notification settings to keep your Local Hunt shop running smoothly.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                  Cancel
                </button>
                <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                  Save changes
                </button>
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              {/* Store Information */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-red-50 p-3">
                    <BuildingStorefrontIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Store information</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your business details that customers see on your storefront.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Store name</span>
                        <input
                          type="text"
                          defaultValue="Nepal Handicrafts Store"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Business category</span>
                        <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200">
                          <option>Handmade & Crafts</option>
                          <option>Fashion & Apparel</option>
                          <option>Gourmet & Organic</option>
                          <option>Home & Living</option>
                          <option>Other</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2 sm:col-span-2">
                        <span className="text-sm font-medium text-gray-700">Store description</span>
                        <textarea
                          rows={3}
                          defaultValue="Authentic Nepali handicrafts and handmade products, sourced directly from local artisans."
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Store location</span>
                        <input
                          type="text"
                          defaultValue="Kathmandu, Nepal"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Business PAN / VAT ID</span>
                        <input
                          type="text"
                          defaultValue="123456789"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <UserCircleIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Profile details</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Keep your contact information up to date for order communications and support.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Full name</span>
                        <input
                          type="text"
                          defaultValue="Mr. Nivesh Shrestha"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Phone number</span>
                        <input
                          type="tel"
                          defaultValue="+977 9841234567"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2 sm:col-span-2">
                        <span className="text-sm font-medium text-gray-700">Email address</span>
                        <input
                          type="email"
                          defaultValue="nivesh@nepalhandicrafts.com"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & Policies */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <TruckIcon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Shipping & policies</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure shipping options and return policies for your store.
                    </p>

                    <div className="mt-6 space-y-5">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Processing time</span>
                        <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200">
                          <option>1-2 business days</option>
                          <option>2-3 business days</option>
                          <option>3-5 business days</option>
                          <option>5-7 business days</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Return policy</span>
                        <textarea
                          rows={3}
                          defaultValue="We accept returns within 7 days of delivery. Items must be unused and in original packaging."
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-amber-50 p-3">
                    <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Protect your account with strong passwords and two-factor authentication.
                    </p>

                    <div className="mt-6 space-y-5">
                      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <KeyIcon className="mt-0.5 h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Change password</p>
                            <p className="text-sm text-gray-500">
                              Update your password to keep your account secure.
                            </p>
                          </div>
                        </div>
                        <button className="self-start rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                          Change
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <DevicePhoneMobileIcon className="mt-0.5 h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Two-factor authentication</p>
                            <p className="text-sm text-gray-500">
                              Add an extra layer of security to your account.
                            </p>
                          </div>
                        </div>
                        <button
                          className={`self-start rounded-full px-4 py-2 text-xs font-semibold transition ${
                            twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        >
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              {/* Notifications */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-yellow-50 p-3">
                    <BellIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Notification preferences</h2>
                    <p className="mt-1 text-sm text-gray-500">Choose how you get alerted about store activity.</p>

                    <div className="mt-6 space-y-4">
                      {notificationSettings.map(option => (
                        <div
                          key={option.id}
                          className="flex gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-red-200"
                        >
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 p-2">
                            <EnvelopeIcon className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                          <button
                            onClick={() => toggleNotification(option.id)}
                            className={`h-7 rounded-full px-3 text-xs font-semibold transition ${
                              notifications[option.id]
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {notifications[option.id] ? 'On' : 'Off'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <BanknotesIcon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Payment settings</h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Manage your bank account and payout preferences.
                    </p>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Bank account</p>
                          <p className="text-xs text-gray-500">****1234 • Nabil Bank</p>
                        </div>
                        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Payout schedule</p>
                          <p className="text-xs text-gray-500">Weekly (Every Friday)</p>
                        </div>
                        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Status */}
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900">Store status</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Your store is currently active and visible to customers.
                </p>
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-emerald-700">Store is live</span>
                </div>
                <button className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                  Temporarily pause store
                </button>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerSetting
