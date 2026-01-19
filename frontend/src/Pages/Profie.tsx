import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaLock, FaCamera } from 'react-icons/fa'
import { sessionUtils } from '../utils/sessionUtils'

interface UserData {
  name: string
  email: string
  phone: string
  avatar?: string | null
}

const Profie = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    avatar: null
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    avatar: null
  })
  const [loading, setLoading] = useState(true)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to view your profile')
        navigate('/login')
        return
      }

      const userId = user.userId

      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`)
      if (response.ok) {
        const data = await response.json()
        let avatarUrl = null
        if (data.profilePicture) {
          avatarUrl = data.profilePicture.startsWith('http')
            ? data.profilePicture
            : `http://localhost:8080${data.profilePicture}`
        }
        setUserData({
          name: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: avatarUrl
        })
        setEditForm({
          name: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: avatarUrl
        })
      } else if (response.status === 404) {
        // User was deleted from database
        sessionUtils.clearSession()
        toast.error('Your account has been deleted. Please contact support.')
        navigate('/login')
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

  const handleEdit = () => {
    setEditForm(userData)
    setIsEditing(true)
  }

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    phone?: string
  }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  const handleSave = async () => {
    const newErrors: typeof errors = {}

    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (editForm.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(editForm.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!editForm.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(editForm.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const user = sessionUtils.getUser()
        if (!user) {
          toast.error('Please login to update your profile')
          navigate('/login')
          return
        }

        const userId = user.userId

        // Normalize phone number (remove any non-digit characters)
        const normalizedPhone = editForm.phone.replace(/\D/g, '')

        const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: editForm.name.trim(),
            email: editForm.email.trim(),
            phone: normalizedPhone,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          let avatarUrl = userData.avatar
          if (data.profilePicture) {
            avatarUrl = data.profilePicture.startsWith('http')
              ? data.profilePicture
              : `http://localhost:8080${data.profilePicture}`
          }
          setUserData({
            name: data.fullName || editForm.name,
            email: data.email || editForm.email,
            phone: data.phone || editForm.phone,
            avatar: avatarUrl,
          })
          setIsEditing(false)
          toast.success('Profile updated successfully!')
          
          // Dispatch event to notify Header component to update profile picture
          if (avatarUrl !== userData.avatar) {
            window.dispatchEvent(new CustomEvent('profilePictureUpdated'))
          }
        } else if (response.status === 404) {
          // User was deleted from database
          sessionUtils.clearSession()
          toast.error('Your account has been deleted. Please contact support.')
          navigate('/login')
        } else {
          const errorMessage = await response.text()
          toast.error(errorMessage || 'Failed to update profile')
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('An error occurred while updating your profile')
      }
    }
  }

  const handleCancel = () => {
    setEditForm(userData)
    setIsEditing(false)
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingPicture(true)
    try {
      const user = sessionUtils.getUser()
      if (!user) {
        toast.error('Please login to upload profile picture')
        return
      }

      const userId = user.userId
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}/picture`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        let avatarUrl = null
        if (data.profilePicture) {
          avatarUrl = data.profilePicture.startsWith('http')
            ? data.profilePicture
            : `http://localhost:8080${data.profilePicture}`
        }
        setUserData({
          ...userData,
          avatar: avatarUrl
        })
        setEditForm({
          ...editForm,
          avatar: avatarUrl
        })
        toast.success('Profile picture updated successfully!')
        
        // Dispatch event to notify Header component to update profile picture
        window.dispatchEvent(new CustomEvent('profilePictureUpdated'))
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to upload profile picture' }))
        toast.error(errorData.message || 'Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('An error occurred while uploading profile picture')
    } finally {
      setUploadingPicture(false)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // For phone, only allow digits and limit to 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
      setEditForm({
        ...editForm,
        [name]: digitsOnly
      })
    } else {
      setEditForm({
        ...editForm,
        [name]: value
      })
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const clearSession = () => {
    sessionUtils.clearSession()
  }

  const handleDeleteAccount = async () => {
    // Double confirmation for account deletion
    const confirmMessage = 'Are you sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n' +
      '• Your profile information\n' +
      '• All your cart items\n' +
      '• All associated data\n\n' +
      'Type "DELETE" to confirm:'
    
    const userInput = window.prompt(confirmMessage)
    
    if (userInput !== 'DELETE') {
      if (userInput !== null) { // User clicked cancel or entered wrong text
        toast.error('Account deletion cancelled. You must type "DELETE" to confirm.')
      }
      return
    }

      try {
        const user = sessionUtils.getUser()
        if (!user) {
          toast.error('Please login to delete your account')
          navigate('/login')
          return
        }

        const userId = user.userId

      // Check if user is SUPERADMIN (prevent deletion)
      if (user.role === 'SUPERADMIN') {
        toast.error('Superadmin accounts cannot be deleted')
        return
      }

      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Clear user data
        clearSession()
        toast.success('Your account has been deleted successfully')
        navigate('/')
      } else if (response.status === 404) {
        // User already deleted
        clearSession()
        toast.error('Account not found')
        navigate('/login')
      } else {
        const error = await response.text()
        toast.error(error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('An error occurred while deleting your account')
    }
  }

  const handleLogout = () => {
    clearSession()
    toast.success('Logged out successfully')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Topbar/>
        <Header/>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-600">Loading profile...</p>
        </div>
        <Footer/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar/>
      <Header/>
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-4"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          const placeholder = parent.querySelector('.avatar-placeholder') as HTMLElement
                          if (placeholder) placeholder.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  {!userData.avatar && (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 avatar-placeholder">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-red-400 text-white p-2 rounded-full hover:bg-red-500 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploadingPicture}
                      className="hidden"
                    />
                    {uploadingPicture ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaCamera className="w-4 h-4" />
                    )}
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-gray-600">{userData.email}</p>
              </div>

            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition"
                  >
                    <FaEdit className="w-5 h-5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <FaCheck className="w-5 h-5" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      <FaTimes className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <FaUser className="w-5 h-5 text-red-600" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900 text-lg">{userData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <FaEnvelope className="w-5 h-5 text-red-600" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900 text-lg">{userData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <FaPhone className="w-5 h-5 text-red-600" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleChange}
                        maxLength={10}
                        inputMode="numeric"
                        placeholder="10 digits only"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900 text-lg">{userData.phone}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Account Settings Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/changepassword')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <FaLock className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Change Password</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

      

                <button 
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600"
                >
                  <span className="font-medium">Delete Account</span>
                  <span>→</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600"
                >
                  <span className="font-medium">Logout</span> 
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  )
}

export default Profie