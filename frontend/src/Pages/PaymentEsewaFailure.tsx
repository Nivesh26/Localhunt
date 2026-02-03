import { useNavigate } from 'react-router-dom'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'

const PaymentEsewaFailure = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            The payment could not be completed. You can try again or choose another payment method.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600"
            >
              Back to Cart
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default PaymentEsewaFailure
