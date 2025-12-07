import { useState } from 'react'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCreditCard, FaLock } from 'react-icons/fa'
import profileImage from '../assets/Nivesh.png'

// Sample user data - in a real app, this would come from context or API
const initialUserData = {
  name: 'Nivesh Shrestha',
  email: 'niveshshrestha@gmail.com',
  phone: '9876543210',
  address: 'Pulchowk, Lalitpur',
  avatar: profileImage
}

const Profie = () => {
  const [userData, setUserData] = useState(initialUserData)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(initialUserData)

  const handleEdit = () => {
    setEditForm(userData)
    setIsEditing(true)
  }

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    phone?: string
    address?: string
  }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  const handleSave = () => {
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

    if (!editForm.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setUserData(editForm)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditForm(userData)
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }))
    }
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
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition">
                    <FaEdit className="w-4 h-4" />
                  </button>
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

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
                    Address
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="address"
                        value={editForm.address}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900 text-lg">{userData.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h3>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <FaLock className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Change Password</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <FaCreditCard className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Purchase History</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600">
                  <span className="font-medium">Delete Account</span>
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