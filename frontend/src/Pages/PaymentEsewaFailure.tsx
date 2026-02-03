import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Topbar from '../Components/Topbar'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { sessionUtils } from '../utils/sessionUtils'

const PaymentEsewaFailure = () => {
  const navigate = useNavigate()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const transactionUuid = sessionStorage.getItem('esewa_pending_transaction_uuid')
    const userIdStr = sessionStorage.getItem('esewa_pending_user_id')
    const user = sessionUtils.getUser()
    const userId = user?.userId ?? (userIdStr ? Number(userIdStr) : null)

    const run = async () => {
      if (transactionUuid && userId) {
        try {
          const res = await fetch('http://localhost:8080/api/payment/esewa-cancel-pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionUuid, userId }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error('Cancel pending failed:', err)
          }
        } catch (e) {
          console.error('Failed to cancel pending eSewa orders:', e)
        }
      }
      sessionStorage.removeItem('esewa_pending_transaction_uuid')
      sessionStorage.removeItem('esewa_pending_user_id')
      toast.error('Something went wrong. Please try again.')
      navigate('/cart', { replace: true })
    }

    run()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Header />
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Something went wrong. Redirecting you to cart...</p>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default PaymentEsewaFailure
