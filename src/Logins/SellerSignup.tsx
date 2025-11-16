import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import hero from '../assets/Hero.png'
import { ShieldCheckIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'

const documentFields = [
  { label: 'Business Registration Certificate', id: 'biz-cert' },
  { label: 'PAN / VAT Certificate', id: 'pan-cert' },
  
]

const Sellerlogin = () => {
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

                <div className="mt-8 space-y-6">
                  {/* Personal information */}
                  <div className="space-y-3 rounded-2xl border border-gray-200 bg-white/60 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Personal information</h3>
                      <p className="text-xs text-gray-500">
                        Details we&apos;ll use to contact you about your seller account.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium text-gray-700">
                        User Name
                        <input
                          type="text"
                          placeholder="Your User Name"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                        <input
                          type="text"
                          placeholder="Phone Number"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Contact Email
                        <input
                          type="text"
                          placeholder="Contact Email"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Location
                        <input
                          type="text"
                          placeholder="Location"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
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
                      <label className="text-sm font-medium text-gray-700">
                        Business Name
                        <input
                          type="text"
                          placeholder="Your Business Name"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Business Category
                        <select className="mt-1 w-full border-b border-gray-300 py-2 text-sm text-gray-700 focus:border-red-500 focus:outline-none">
                          <option value="">Select category</option>
                          <option value="handmade">Handmade & Crafts</option>
                          <option value="fashion">Fashion & Apparel</option>
                          <option value="gourmet">Gourmet & Organic</option>
                          <option value="home">Home & Living</option>
                          <option value="masks">Masks</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Business PAN / VAT ID
                        <input
                          type="text"
                          placeholder="PAN / VAT ID"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Business Location
                        <input
                          type="text"
                          placeholder="City, Region"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
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
                      <label className="text-sm font-medium text-gray-700">
                        Password
                        <input
                          type="password"
                          placeholder="Create a password"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Confirm Password
                        <input
                          type="password"
                          placeholder="Repeat password"
                          className="mt-1 w-full border-b border-gray-300 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>

                

                  <div className="space-y-4 rounded-2xl border border-dashed border-red-200 bg-red-50/70 p-4 text-xs text-red-700">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <p>
                        Local Hunt verifies every seller to keep customers safe. Uploading your compliance documents now helps you get activated in under 48 hours.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {documentFields.map(doc => (
                        <label key={doc.id} className="text-xs font-medium text-red-700">
                          {doc.label}
                          <input
                            id={doc.id}
                            type="file"
                            className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-red-700"
                          />
                        </label>
                      ))}
                      
                    </div>
                    <p className="text-[11px] text-red-600">
                      Accepted formats: PDF, JPG, PNG (max 5MB each). Ensure details are clearly visible to avoid delays.
                    </p>
                  </div>

          

                  <button className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                    Submit Application
                  </button>
                </div>

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
