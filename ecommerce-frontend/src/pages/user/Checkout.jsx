import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiatePayment, simulatePayment } from '../../api/payments'
import Button from '../../components/ui/Button'

export default function Checkout() {
  const params = new URLSearchParams(window.location.search)
  const orderId = params.get('order')
  const navigate = useNavigate()
  const [paying, setPaying] = useState(false)

  const handlePay = async () => {
    setPaying(true)
    try {
      const payment = await initiatePayment(orderId, 'card')
      await simulatePayment(payment.id)
      navigate(`/orders/${orderId}`)
    } catch {
      alert('Payment failed')
      setPaying(false)
    }
  }

  if (!orderId) return <p className="text-center text-gray-500">No order specified</p>

  return (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="text-gray-500 mt-2">Complete payment for order #{orderId}</p>
      <Button onClick={handlePay} className="mt-6 w-full" disabled={paying}>
        {paying ? 'Processing...' : 'Pay with Card'}
      </Button>
    </div>
  )
}
