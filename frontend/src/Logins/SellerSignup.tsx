import { useState } from 'react'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import hero from '../assets/Hero.png'
import { FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const documentFields = [
  { label: 'Business Registration Certificate', id: 'biz-cert' },
  { label: 'PAN / VAT Certificate', id: 'pan-cert' },
  
]

const Sellerlogin = () => {
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    contactEmail: '',
    location: '',
    businessName: '',
    businessCategory: '',
    businessPanVat: '',
    businessLocation: '',
    password: '',
    confirmPassword: ''
  })
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({})
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [id]: 'File size must be less than 5MB' }))
        return
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [id]: 'File must be PDF, JPG, or PNG' }))
        return
      }
      setDocuments(prev => ({ ...prev, [id]: file }))
      if (errors[id]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[id]
          return newErrors
        })
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    // Personal information validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'User name is required'
    } else if (formData.userName.trim().length < 2) {
      newErrors.userName = 'User name must be at least 2 characters'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number'
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    // Business details validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!formData.businessCategory) {
      newErrors.businessCategory = 'Business category is required'
    }

    if (!formData.businessPanVat.trim()) {
      newErrors.businessPanVat = 'PAN / VAT ID is required'
    }

    if (!formData.businessLocation.trim()) {
      newErrors.businessLocation = 'Business location is required'
    }

    // Account security validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Document validation
    documentFields.forEach(doc => {
      if (!documents[doc.id]) {
        newErrors[doc.id] = `${doc.label} is required`
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log('Seller signup submitted:', { formData, documents })
    }
  }

  return (
    <div>
      <Topbar/>
      <Header/>
      
      <div className="relative min-h-screen py-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={hero}
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex justify-center items-center min-h-screen px-4">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl px-8 py-12 w-full max-w-4xl">
            <div className="grid gap-10 lg:grid-cols-[1.3fr,1fr]">
              {/* Form section */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-xs font-semibold text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600"></span>
                  Sell With Local Hunt
                </span>
                <h2 className="mt-4 text-3xl font-bold text-gray-900">Open Your Seller Account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Join a curated community of Nepali artisans, producers, and retailers. We help you showcase products worldwide while managing logistics and secure payouts for you.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {/* Personal information */}
                  <div className="space-y-3 rounded-2xl border border-gray-200 bg-white/60 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Personal information</h3>
                      <p className="text-xs text-gray-500">
                        Details we&apos;ll use to contact you about your seller account.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          User Name
                          <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Your User Name"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.userName ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Phone Number
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            maxLength={10}
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.phoneNumber ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Contact Email
                          <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            placeholder="Contact Email"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.contactEmail ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Location
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Location"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.location ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Business details */}
                  <div className="space-y-3 rounded-2xl border border-gray-200 bg-white/60 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Business details</h3>
                      <p className="text-xs text-gray-500">
                        Information that appears on invoices and is used for compliance checks.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Business Name
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Your Business Name"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.businessName ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Business Category
                          <select
                            name="businessCategory"
                            value={formData.businessCategory}
                            onChange={handleChange}
                            className={`mt-1 w-full border-b py-2 text-sm text-gray-700 focus:outline-none ${
                              errors.businessCategory ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          >
                            <option value="">Select category</option>
                            <option value="handmade">Handmade & Crafts</option>
                            <option value="fashion">Fashion & Apparel</option>
                            <option value="gourmet">Gourmet & Organic</option>
                            <option value="home">Home & Living</option>
                            <option value="masks">Masks</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                        {errors.businessCategory && <p className="text-red-500 text-xs mt-1">{errors.businessCategory}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Business PAN / VAT ID
                          <input
                            type="text"
                            name="businessPanVat"
                            value={formData.businessPanVat}
                            onChange={handleChange}
                            placeholder="PAN / VAT ID"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.businessPanVat ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.businessPanVat && <p className="text-red-500 text-xs mt-1">{errors.businessPanVat}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Business Location
                          <input
                            type="text"
                            name="businessLocation"
                            value={formData.businessLocation}
                            onChange={handleChange}
                            placeholder="City, Region"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.businessLocation ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.businessLocation && <p className="text-red-500 text-xs mt-1">{errors.businessLocation}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Account security */}
                  <div className="space-y-3 rounded-2xl border border-gray-200 bg-white/60 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Account security</h3>
                      <p className="text-xs text-gray-500">
                        Create a secure password to protect access to your seller dashboard.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Password
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.password ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Confirm Password
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repeat password"
                            className={`mt-1 w-full border-b py-2 text-sm focus:outline-none ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                          />
                        </label>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                

                  <div className="space-y-4 rounded-2xl border border-dashed border-red-200 bg-red-50/70 p-4 text-xs text-red-700">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className="h-4 w-4" />
                      <p>
                        Local Hunt verifies every seller to keep customers safe. Uploading your compliance documents now helps you get activated in under 48 hours.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {documentFields.map(doc => (
                        <div key={doc.id}>
                          <label className="text-xs font-medium text-red-700">
                            {doc.label}
                            <input
                              id={doc.id}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, doc.id)}
                              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-red-700 ${
                                errors[doc.id] ? 'border-red-500' : 'border-red-200'
                              }`}
                            />
                          </label>
                          {errors[doc.id] && <p className="text-red-500 text-xs mt-1">{errors[doc.id]}</p>}
                        </div>
                      ))}
                      
                    </div>
                    <p className="text-[11px] text-red-600">
                      Accepted formats: PDF, JPG, PNG (max 5MB each). Ensure details are clearly visible to avoid delays.
                    </p>
                  </div>

          

                  <button type="submit" className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                    Submit Application
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  Already registered?{' '}

                   <Link to="/sellerlogin" className="font-semibold text-red-600 hover:underline" > Login</Link>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Secure payments
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    48h onboarding
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Dedicated support
                  </span>
                </div>
              </div>

              {/* Side info panel */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-red-600/90 p-6 text-white shadow-lg">
                  <h3 className="text-lg font-semibold">Why sellers choose Local Hunt</h3>
                  <ul className="mt-4 space-y-3 text-sm text-red-50">
                    <li>• Showcase authentic Nepali products to global buyers</li>
                    <li>• Integrated logistics & cashless payouts every week</li>
                    <li>• Marketing boosts during seasonal campaigns</li>
                    <li>• Transparent dashboard to track growth</li>
                  </ul>
               
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  )
}

export default Sellerlogin
