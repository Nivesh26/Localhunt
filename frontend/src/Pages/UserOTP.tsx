import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Topbar from '../Components/Topbar'
import { sessionUtils } from '../utils/sessionUtils'

export const UserOTP = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({})

  useEffect(() => {
    // Get email from navigation state (if coming from login)
    const state = location.state as { email?: string; loginType?: string } | undefined
    
    // Prevent direct access - if no email in state, redirect to login
    if (!state?.email) {
      toast.error('Please login first to access OTP page')
      navigate('/login')
      return
    }
    
    // Only allow if loginType is 'user' (regular user login, which includes superadmin via regular login)
    // Superadmin logs in through regular login page, not seller login
    if (state.loginType && state.loginType === 'seller') {
      toast.error('Please use seller login page')
      navigate('/sellerlogin')
      return
    }
    
    setEmail(state.email)
    setOtpSent(true) // OTP already sent from login page
  }, [location, navigate])

  useEffect(() => {
    // Redirect if already logged in
    const user = sessionUtils.getUser()
    if (user) {
      if (user.role === 'SUPERADMIN') {
        navigate('/admindashboard')
      } else if (user.role === 'VENDOR') {
        navigate('/sellerdashboard')
      } else {
        navigate('/')
      }
    }
  }, [navigate])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleRequestOTP = async () => {
    const newErrors: { email?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      // Determine if it's user or seller login based on email or route
      const loginType = location.state?.loginType || 'user'
      const endpoint = loginType === 'seller' 
        ? 'http://localhost:8080/api/seller/request-otp'
        : 'http://localhost:8080/api/auth/request-otp'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('OTP sent to your email. Please check your inbox.')
        setOtpSent(true)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('OTP request error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const newErrors: { otp?: string } = {}

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required'
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits'
    } else if (!/^\d+$/.test(otp)) {
      newErrors.otp = 'OTP must contain only numbers'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      // Determine if it's user or seller login
      const loginType = location.state?.loginType || 'user'
      const endpoint = loginType === 'seller'
        ? 'http://localhost:8080/api/seller/verify-otp'
        : 'http://localhost:8080/api/auth/verify-otp'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Login successful!')
        // Store user data
        sessionUtils.setUser({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        })
        // Redirect based on role
        setTimeout(() => {
          const role = data.role
          if (role === 'SUPERADMIN') {
            navigate('/admindashboard')
          } else if (role === 'VENDOR') {
            navigate('/sellerdashboard')
          } else {
            navigate('/')
          }
        }, 1000)
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Topbar />
      <Header />

      <div className="flex justify-center items-center min-h-screen bg-gray-100 py-12">
        <div className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Enter OTP</h2>
          
          <p className="text-center text-sm text-gray-600 mb-6">
            We've sent a One-Time Password (OTP) to your email. Please enter it below to complete login.
          </p>

          {/* Email Input (if OTP not sent yet) */}
          {!otpSent && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                placeholder="Enter your email"
                className={`w-full border-b py-2 focus:outline-none ${
                  errors.email ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
                }`}
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          )}

          {/* OTP Input (shown when OTP is sent) */}
          {otpSent && (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  OTP sent to: <span className="font-semibold text-gray-900">{email}</span>
                </p>
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                    if (errors.otp) setErrors({ ...errors, otp: undefined })
                  }}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className={`w-full border-b py-2 text-center text-2xl tracking-widest focus:outline-none ${
                    errors.otp ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
                  }`}
                  disabled={loading}
                />
                {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {!otpSent ? (
              <button
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : (
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-gray-600 py-2 rounded-full font-medium hover:text-gray-900 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
