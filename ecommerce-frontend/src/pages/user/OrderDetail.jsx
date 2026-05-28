import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function OrderDetail() {
  const { id } = useParams()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
  })

  if (isLoading) return <Spinner />
  if (!order) return <p className="text-center text-gray-500">Order not found</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
        <Badge status={order.status} />
      </div>

      <Card className="mb-6">
        <p className="text-sm text-gray-500">
          Placed on {new Date(order.created_at).toLocaleString()}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">${order.total.toFixed(2)}</p>
      </Card>

      <h2 className="font-semibold text-gray-900 mb-2">Items</h2>
      <div className="space-y-2 mb-6">
        {(order.items || []).map((item, i) => (
          <Card key={i} className="py-3">
            <p className="font-medium">{item.name || `Product ${item.product_id}`}</p>
            <p className="text-sm text-gray-500">
              Qty: {item.quantity} &middot; ${(item.price || 0).toFixed(2)} each
            </p>
          </Card>
        ))}
      </div>

      {order.status === 'pending' && (
        <Link to={`/checkout?order=${order.id}`}>
          <Button className="w-full">Pay Now</Button>
        </Link>
      )}
    </div>
  )
}
