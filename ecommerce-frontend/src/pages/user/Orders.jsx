import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listOrders } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  })

  if (isLoading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      {orders?.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()} &middot; ${order.total.toFixed(2)}
                  </p>
                </div>
                <Badge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
