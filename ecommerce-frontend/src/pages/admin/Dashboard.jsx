import { useQuery } from '@tanstack/react-query'
import { getStats } from '../../api/admin'
import Spinner from '../../components/ui/Spinner'

const cards = [
  { key: 'orders', label: 'Total Orders', color: 'bg-blue-50 text-blue-700' },
  { key: 'total_revenue', label: 'Revenue', color: 'bg-green-50 text-green-700', prefix: '$' },
  { key: 'users', label: 'Users', color: 'bg-purple-50 text-purple-700' },
  { key: 'products', label: 'Products', color: 'bg-yellow-50 text-yellow-700' },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStats,
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.key} className={`rounded-xl p-6 ${c.color}`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-1">
              {c.prefix || ''}{stats?.[c.key]?.toLocaleString() ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
