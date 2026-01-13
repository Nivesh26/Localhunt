import { useState } from 'react'
import {
  FaBell,
  FaEnvelope,
  FaKey,
  FaShieldAlt,
  FaMobileAlt,
  FaUserCircle,
} from 'react-icons/fa'
import AdminNavbar from '../AdminComponents/AdminNavbar'

const notificationSettings = [
  { id: 'newOrders', label: 'New vendor signup requests', description: 'Get notified when a seller submits an onboarding form.' },
  { id: 'disputes', label: 'Dispute updates', description: 'Receive alerts for escalations that need admin attention.' },
  { id: 'payouts', label: 'Payout issues', description: 'Email me whenever payouts fail or are delayed.' },
  { id: 'system', label: 'System announcements', description: 'Security updates, scheduled maintenance and new releases.' },
]

const AdminSetting = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    newOrders: true,
    disputes: true,
    payouts: false,
    system: true,
  })

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminNavbar />

        <main className="flex-1 space-y-8">
          <header className="rounded-2xl bg-white px-6 py-6 shadow-sm sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Admin settings</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">Control Center</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Manage your profile, update security preferences, and configure notification channels for the admin team.
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
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-red-50 p-3">
                    <FaUserCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Profile details</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Keep organisation information up to date for invoices and contact points.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Full name</span>
                        <input
                          type="text"
                          defaultValue="Super Admin"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Role</span>
                        <input
                          type="text"
                          defaultValue="Marketplace Administrator"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Email address</span>
                        <input
                          type="email"
                          defaultValue="admin@localhunt.com"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Phone number</span>
                        <input
                          type="tel"
                          defaultValue="+1 202 555 0185"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <FaShieldAlt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Strengthen access controls to protect seller and customer records.
                    </p>

                    <div className="mt-6 space-y-5">
                      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <FaKey className="mt-0.5 h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Password requirements</p>
                            <p className="text-sm text-gray-500">
                              Enforce 2FA setup and complex passwords for internal accounts.
                            </p>
                          </div>
                        </div>
                        <button className="self-start rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                          Configure
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <FaMobileAlt className="mt-0.5 h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Two-factor authentication</p>
                            <p className="text-sm text-gray-500">
                              Require verification codes when signing in from new devices.
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
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-yellow-50 p-3">
                    <FaBell className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">Notification channels</h2>
                    <p className="mt-1 text-sm text-gray-500">Choose how you get alerted about marketplace activity.</p>

                    <div className="mt-6 space-y-4">
                      {notificationSettings.map(option => (
                        <div
                          key={option.id}
                          className="flex gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-red-200"
                        >
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 p-2">
                            <FaEnvelope className="h-6 w-6 text-red-500" />
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

              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900">Access and roles</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Invite additional admins and manage specific permissions for finance, operations and support.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Finance manager</p>
                      <p className="text-xs text-gray-500">Can process payouts and download invoices.</p>
                    </div>
                    <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                      View access
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Support lead</p>
                      <p className="text-xs text-gray-500">Handles escalations and manages dispute templates.</p>
                    </div>
                    <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                      Manage
                    </button>
                  </div>
                </div>
                <button className="mt-6 w-full rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-red-300 hover:text-red-600">
                  Invite new admin
                </button>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AdminSetting