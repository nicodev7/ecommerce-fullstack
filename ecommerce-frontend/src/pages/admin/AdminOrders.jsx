import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAllOrders } from '../../api/admin'
import { updateOrderStatus } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: listAllOrders,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order ID</th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.user_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-right">${o.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
