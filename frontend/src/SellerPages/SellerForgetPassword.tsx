import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import Topbar from '../Components/Topbar'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export const SellerForgetPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; otp?: string; password?: string; confirmPassword?: string }>({})
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first OTP input when step changes to reset
    if (step === 'reset' && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [step])

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
      const response = await fetch('http://localhost:8080/api/seller/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password reset OTP sent to your email. Please check your inbox.')
        setStep('reset')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedOtp.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedOtp.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResetPassword = async () => {
    const otpString = otp.join('')
    const newErrors: { otp?: string; password?: string; confirmPassword?: string } = {}

    if (!otpString || otpString.length !== 6) {
      newErrors.otp = 'Please enter the 6-digit OTP'
    }

    if (!newPassword) {
      newErrors.password = 'New password is required'
    } else if (newPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/seller/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpString,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password reset successfully! Please login with your new password.')
        setTimeout(() => {
          navigate('/sellerlogin')
        }, 500)
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar />
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'email' 
                ? 'Enter your email to receive a password reset OTP'
                : 'Enter the OTP sent to your email and set a new password'}
            </p>
          </div>

          {step === 'email' ? (
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
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
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              {/* Back to Login */}
              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/sellerlogin" className="text-red-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enter OTP
                </label>
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 ${
                        errors.otp ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-xs mt-2 text-center">{errors.otp}</p>}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (errors.password) setErrors({ ...errors, password: undefined })
                    }}
                    placeholder="Enter new password"
                    className={`w-full border-b py-2 pr-10 focus:outline-none ${
                      errors.password ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                    }}
                    placeholder="Confirm new password"
                    className={`w-full border-b py-2 pr-10 focus:outline-none ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Reset Password Button */}
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              {/* Back to Email Step */}
              <p className="text-center text-sm text-gray-600">
                Didn't receive OTP?{' '}
                <button
                  onClick={() => {
                    setStep('email')
                    setOtp(['', '', '', '', '', ''])
                  }}
                  className="text-red-600 hover:underline font-medium"
                >
                  Resend
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SellerForgetPassword
