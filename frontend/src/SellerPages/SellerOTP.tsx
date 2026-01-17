import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Topbar from '../Components/Topbar'
import { sessionUtils } from '../utils/sessionUtils'

export const SellerOTP = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(new Array(6).fill('')) // Array for 6 OTP inputs
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({})
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Refs for OTP inputs

  useEffect(() => {
    const state = location.state as { email?: string; loginType?: string } | undefined

    if (!state?.email) {
      toast.error('Please login first to access OTP page')
      navigate('/sellerlogin')
      return
    }

    if (state.loginType && state.loginType !== 'seller') {
      toast.error('Please use the correct login page')
      navigate('/login')
      return
    }

    setEmail(state.email)
    setOtpSent(true)
  }, [location, navigate])

  useEffect(() => {
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
      const response = await fetch('http://localhost:8080/api/seller/request-otp', {
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
        setOtp(new Array(6).fill('')) // Clear OTP inputs on resend
        inputRefs.current[0]?.focus(); // Focus first input
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
    const enteredOtp = otp.join(''); // Join array to form 6-digit string
    const newErrors: { otp?: string } = {}

    if (!enteredOtp.trim()) {
      newErrors.otp = 'OTP is required'
    } else if (enteredOtp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits'
    } else if (!/^\d+$/.test(enteredOtp)) {
      newErrors.otp = 'OTP must contain only numbers'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/seller/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: enteredOtp }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Login successful!')
        sessionUtils.setUser({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        })
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

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (/[^0-9]/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Clear OTP error if all inputs are filled
    if (newOtp.every(digit => digit !== '') && errors.otp) {
      setErrors({ ...errors, otp: undefined });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <Topbar />
      <Header />

      <div className="flex justify-center items-center min-h-screen bg-gray-100 py-12">
        <div className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-xs font-semibold text-red-600 mb-4">
              Vendor Access
            </span>
            <h2 className="text-2xl font-semibold text-center mb-2">Enter OTP</h2>
            <p className="text-center text-sm text-gray-600">
              We've sent a One-Time Password (OTP) to your email. Please enter it below to complete login.
            </p>
          </div>

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
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={(el) => { inputRefs.current[index] = el }}
                      className={`w-10 h-12 text-center text-2xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 ${
                        errors.otp ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                      }`}
                      disabled={loading}
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp}</p>}
              </div>
            </>
          )}

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
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/sellerlogin')}
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
