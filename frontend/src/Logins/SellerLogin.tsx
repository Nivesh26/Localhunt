import { useState, useEffect } from 'react'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import hero from '../assets/Hero.png'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { sessionUtils } from '../utils/sessionUtils'

const SellerLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Redirect if already logged in (check sessionStorage for this tab)
    const user = sessionUtils.getUser()
    if (user) {
      if (user.role === 'VENDOR') {
        navigate('/sellerdashboard')
      } else if (user.role === 'SUPERADMIN') {
        navigate('/admindashboard')
      } else {
        navigate('/')
      }
    }
  }, [navigate])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with login
      handleLogin()
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/seller/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Login successful!')
        // Store seller data in sessionStorage (tab-specific)
        sessionUtils.setUser({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        })
        // Redirect to seller dashboard
        setTimeout(() => {
          navigate('/sellerdashboard')
        }, 1000)
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Topbar />
      <Header />

      <div className="relative min-h-screen py-12">
        <div className="absolute inset-0 z-0">
          <img src={hero} alt="Background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="space-y-6 px-10 py-12">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-xs font-semibold text-red-600">
                    Seller Access
                  </span>
                  <h1 className="mt-4 text-3xl font-bold text-gray-900">Log in to your seller portal</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Manage your products, track orders, and access payouts from one dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (errors.email) setErrors({ ...errors, email: undefined })
                        }}
                        placeholder="Email"
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                          errors.email ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                        }`}
                      />
                    </label>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mt-1">
                      Password
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (errors.password) setErrors({ ...errors, password: undefined })
                          }}
                          placeholder="Enter your password"
                          className={`mt-1 w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                            errors.password ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </label>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      Remember me
                    </label>
                    <a href="#" className="font-semibold text-red-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-xl bg-red-400 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                  </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  New to Local Hunt?{' '}
                  <Link to="/sellersignup" className="font-semibold text-red-600 hover:underline">
                    Create a seller account
                  </Link>
                </div>
              </div>

              <div className="hidden flex-col justify-between bg-red-600/90 p-10 text-white lg:flex">
                <div>
                  <h2 className="text-xl font-semibold">Welcome back!</h2>
                  <p className="mt-3 text-sm text-red-50">
                    Need help with onboarding or catalog updates? Book a call with our marketplace success team and we’ll walk you through growth best practices.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-red-50">
                  <p>• Track orders and manage inventory in real-time</p>
                  <p>• Download statements and payouts history</p>
                  <p>• Join seasonal campaigns curated for Nepali products</p>
                </div>

                <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  Contact Seller Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SellerLogin
