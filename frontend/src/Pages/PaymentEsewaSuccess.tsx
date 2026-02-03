import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'

const PaymentEsewaSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      setStatus('error')
      setMessage('Invalid response from eSewa.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/payment/esewa-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        })
        const result = await res.json().catch(() => ({}))
        if (res.ok && result.success) {
          setStatus('success')
          toast.success('Payment successful!')
        } else {
          setStatus('error')
          setMessage(result.message || 'Payment verification failed.')
        }
      } catch (err) {
        setStatus('error')
        setMessage('Unable to verify payment.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Verifying your payment...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h1>
              <p className="text-gray-600 mb-6">Thank you! Your order has been placed.</p>
              <button
                onClick={() => navigate('/ordertracking')}
                className="w-full py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600"
              >
                View Order Status
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/cart')}
                className="w-full py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Cart
              </button>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default PaymentEsewaSuccess
