import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FaShieldAlt,
  FaUserCircle,
  FaLock,
} from 'react-icons/fa'
import AdminNavbar from '../AdminComponents/AdminNavbar'
import { sessionUtils } from '../utils/sessionUtils'

interface ProfileData {
  fullName: string
  email: string
  phone: string
  role: string
}

const AdminSetting = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    role: 'SUPERADMIN'
  })
  const [originalProfile, setOriginalProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    role: 'SUPERADMIN'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  useEffect(() => {
    // Check if profile has changed
    const changed = 
      profile.fullName !== originalProfile.fullName ||
      profile.email !== originalProfile.email ||
      profile.phone !== originalProfile.phone
    setHasChanges(changed)
  }, [profile, originalProfile])

  const fetchAdminProfile = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to view your profile')
        return
      }

      const userId = user.userId
      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        const profileData: ProfileData = {
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'SUPERADMIN'
        }
        setProfile(profileData)
        setOriginalProfile(profileData)
      } else if (response.status === 404) {
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
      } else {
        toast.error('Failed to fetch profile data')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('An error occurred while fetching your profile')
} finally {
        setLoading(false)
      }
    }

  const handleCancel = () => {
    setProfile(originalProfile)
    setHasChanges(false)
    toast.info('Changes discarded')
  }

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No changes to save')
      return
    }

    // Validation
    if (!profile.fullName.trim()) {
      toast.error('Full name is required')
      return
    }

    if (!profile.email.trim()) {
      toast.error('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!profile.phone.trim()) {
      toast.error('Phone number is required')
      return
    }

    const phoneRegex = /^[0-9]{10}$/
    const normalizedPhone = profile.phone.replace(/\D/g, '')
    if (!phoneRegex.test(normalizedPhone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setSaving(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to update your profile')
        return
      }

      const userId = user.userId
      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          email: profile.email.trim(),
          phone: normalizedPhone,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const updatedProfile: ProfileData = {
          fullName: data.fullName || profile.fullName,
          email: data.email || profile.email,
          phone: data.phone || profile.phone,
          role: data.role || profile.role
        }
        setProfile(updatedProfile)
        setOriginalProfile(updatedProfile)
        setHasChanges(false)
        
        // Update session if email changed
        if (data.email && data.email !== user.email) {
          sessionUtils.setUser({
            ...user,
            email: data.email,
            fullName: data.fullName
          })
        }
        
        toast.success('Profile updated successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }))
        toast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred while updating your profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6 px-4 sm:px-6 py-8 pt-14 lg:pt-8">
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
                <button 
                  onClick={handleCancel}
                  disabled={!hasChanges || saving}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save changes'}
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

                    {loading ? (
                      <div className="mt-6 text-center text-gray-500">Loading profile...</div>
                    ) : (
                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-gray-700">Full name</span>
                          <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Enter full name"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-gray-700">Email address</span>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Enter email address"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-gray-700">Phone number</span>
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '')
                              if (value.length <= 10) {
                                setProfile({ ...profile, phone: value })
                              }
                            }}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Enter 10-digit phone number"
                            maxLength={10}
                          />
                        </label>
                      </div>
                    )}
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
                          <FaLock className="mt-0.5 h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Change Password</p>
                            <p className="text-sm text-gray-500">
                              Update your password to keep your account secure.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/adminchangepassword')}
                          className="self-start rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  )
}

export default AdminSetting