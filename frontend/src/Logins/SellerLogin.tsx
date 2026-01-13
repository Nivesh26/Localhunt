import { useState } from 'react'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import hero from '../assets/Hero.png'
import { Link } from 'react-router-dom'

const SellerLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

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
      console.log('Seller login submitted:', { email, password })
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
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (errors.password) setErrors({ ...errors, password: undefined })
                        }}
                        placeholder="Enter your password"
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${
                          errors.password ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                        }`}
                      />
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

                  <button type="submit" className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                    Log In
                  </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  New to Local Hunt?{' '}
                  <Link to="/seller-signup" className="font-semibold text-red-600 hover:underline">
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
